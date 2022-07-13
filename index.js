var express = require('express'); 
var app = express(); 
app.use(express.static('images'));
app.set('view engine', 'ejs'); 
app.use(express.static('public'));


var bcrypt = require('bcryptjs');

var bodyparser=require('body-parser');
var urlencoded=bodyparser.urlencoded({extended:true});

var mongoose = require('mongoose');
mongoose.connect('mongodb://hci:123@cluster0-shard-00-00.2792g.mongodb.net:27017,cluster0-shard-00-01.2792g.mongodb.net:27017,cluster0-shard-00-02.2792g.mongodb.net:27017/shopping?ssl=true&replicaSet=atlas-hxd69j-shard-0&authSource=admin&retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology: true});
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ console.log("connection succeeded"); })

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://hci:123@cluster0-shard-00-00.2792g.mongodb.net:27017,cluster0-shard-00-01.2792g.mongodb.net:27017,cluster0-shard-00-02.2792g.mongodb.net:27017/shopping?ssl=true&replicaSet=atlas-hxd69j-shard-0&authSource=admin&retryWrites=true&w=majority";

app.get('/home', (req, res)=>{ 
    res.render('shop',{g:0,l:0,i:0,nu:0,user:{userid:0,user:"h"}});
    }); 
app.get('/', (req, res)=>{ 
    res.render('login',{g:0,l:0,i:0,nu:0,usex:0});
    }); 
app.get('/login', (req, res)=>{ 
    res.render('login',{g:0,l:0,i:0,nu:0,usex:0});
    });   

app.get('/shop', (req, res)=>{
    res.render('shop');
    });
/*app.get('/cat', (req, res)=>{
    console.log(req.query.id);
    data=db.collection("products").find();
    data.each(function(err, doc) {
        if(doc!=null){
        console.log(doc.image);
        item ={image:doc.image,title:doc.title,price:doc.title,category:doc.category,amount:doc.amount};
        }        
    });
    res.render('cat',{ data: item});
    });*/
app.get('/checkout', (req, res)=>{
    var query = { itemid : req.query.id };
    db.collection("products").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.render('checkout',{data:result});
    });
});

app.post('/searching',urlencoded,(req,res)=>{
    //console.log(req.body.item);
    var item= req.body.search;
    console.log("hello")
    console.log(item)
    // db.collection("products").find( { title : { $regex : item } } ).toArray(function(err, doc) {
    //     if (err) throw err;
    //     if(doc!=null){
    //         console.log(doc)
    //         console.log("hello")
    //     res.render('shop');
    //     }});
    var newarr1=[]
    db.collection('products').find({}).toArray(function(err, prod) {
        if (err) throw err;
        prod.forEach(element => {
            titleele = element.title.toLowerCase().split(" ");
            searchele = item.toLowerCase().split(" ");
            console.log(titleele);
            console.log(searchele);
            f = 0;
            titleele.forEach(ele => {
                if (searchele.includes(ele)){
                    f = 1;
                }
            });
            if(f == 1){
                newarr1.push(element);
                console.log(element.title);
            }
        });
        console.log(newarr1.length);
        res.render('search',{data:newarr1});
    });

})

app.post('/registerdo',urlencoded,function(req,res){
    var a=req.body.input0;
    var b=req.body.input3;
    var c=req.body.input4;
    var d=req.body.input5;
    var count = 0;
    bcrypt.hash(d, 10, function(err, hash) {
        var newpwd = hash;
        details={
            user:a,email:b,number:c,password:newpwd,userid:a,cart:['']
        };
            MongoClient.connect(url,{ useNewUrlParser: true },function(err,db){
            if(err) throw err;
            var db=db.db('shopping');
            query={email:b};
                db.collection('users').find(query).toArray(function(err,result){
                    if(result[0]){
                        res.render("shop",{g:0,l:0,nu:0,i:0,usex:1});
                    }
                    else{
                        db.collection('users').insertOne(details,function(err,result){
                        if(err) throw err;
                        MongoClient.connect(url,function(err,db){
                            if(err) throw err;
                            var db=db.db('shopping');
                            db.collection('news').find({}).toArray(function(err,result){
                                if (err) throw err;
                                result.current = "trending1";
                                res.render("shop",{news:result,setc:1,sgn:1,user:details});
                            })
                        });
                    });
                }
            });
        });
    });
});

app.post('/sort',urlencoded,function(req,res){
    var a=req.body.sortname;
    console.log(a);
    data=db.collection("products").find();
    var sortarr = [];
    db.collection("products").find({}).toArray(function(err, doc) {
        if (err) throw err;
        if(doc!=null){
            //console.log(doc)
            doc.forEach(element=>{
                //console.log(element.category)
                //console.log(req.query.id)
                if(element.category == req.query.id){
                    sortarr.push(element.amount)
                }
            });
            console.log(sortarr)
            for (i=0; i < sortarr.length; i++){
                for (j=0, stop=sortarr.length-i; j < stop; j++){
                    if (sortarr[j] > sortarr[j+1]){
                        var temp = sortarr[j];
                        sortarr[j] = sortarr[j+1];
                        sortarr[j+1] = temp;
                    }
                }
            }
            console.log(sortarr)
            var finalarr = [];
            if(a == 1){
            for(i=0;i<sortarr.length;i++){
            doc.forEach(element=>{
                    if(element.amount == sortarr[i]){
                        finalarr.push(element)
                    }
            });
            }
            res.render('cat',{data:finalarr,data1:req.query.id});
        }
        else{
            for(i=sortarr.length;i>0;i--){
                doc.forEach(element=>{
                        if(element.amount == sortarr[i]){
                            finalarr.push(element)
                        }
                });
                }
                res.render('cat',{data:finalarr,data1:req.query.id});
        }
        
        }   
    });
    
});
app.post('/logindo',urlencoded,function(req,res){
    var a=req.body.input1;
    var b=req.body.input2;
    var q = {email:a};
    MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var db=db.db('shopping');
        db.collection("users").findOne(q, function(err, result) {
            if(result){
                var hash = result.password;
                bcrypt.compare(b, hash, function(err, res1) {
                    if(res1) {
                        console.log(result)
                        res.render("shop",{setc:1,sgn:0,user:result});
                    }
                    else {
                        res.render("login",{g:0,l:0,i:1,nu:0,usex:0});
                    } 
                }); 
            }
            else{
                res.render("login",{g:0,l:0,nu:1,i:0,usex:0});
            }
    });
});
})
app.get('/cart', (req, res)=>{ 
    var query = { userid : req.query.id };
    db.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        var totids=result[0].cart;
        var newarr=[];
        var total= 0;
        db.collection('products').find({}).toArray(function(err, prod) {
            if (err) throw err;
            prod.forEach(element => {
                if(totids.includes(element.itemid)){
                    newarr.push(element);
                    total+=element.amount;
                }
            });
            res.render('cart',{data:newarr,sum:total,userid : req.query.id,del:-1});
        });
    });
    });

    app.get('/remove', (req, res)=>{ 
        var query = { userid : req.query.id };
        var query1 = req.query.id1;
        console.log(query)
        console.log(query1)
        db.collection("users").find(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log(result[0].cart)
            var totids=result[0].cart;
            var newarr=[];
            var total= 0;
            var indexa = 0;
            db.collection('products').find({}).toArray(function(err, prod) {
                if (err) throw err;
                prod.forEach(element => {
                    if(totids.includes(element.itemid)){
                        newarr.push(element);
                        total+=element.amount;
                        if(element.itemid==query1){
                            total-=(element.amount);
                        }
                    }
                });
            var finarr=[];
            for(i=0;i<totids.length;i++){
                if(totids[i]!=query1){
                    finarr.push(totids[i])
                }
            }
            console.log(finarr)
            var myquery = { userid : req.query.id };
            var newvalues = { $set: { cart : finarr } };
            db.collection("users").updateOne(myquery, newvalues, function(err, ress) {
              if (err) throw err;
              console.log("1 document updated");
              var query = { userid : req.query.id };
            })
                res.render('cart',{data:newarr,sum:total,userid:req.query.id,del:query1});
            });
        });
});



app.post('/addedtocart',urlencoded,(req,res)=>{
    //console.log(req.body.item);
    //console.log(req.query.id);
    var item= req.body.item;
    var user1 = req.query.id;
    user1=user1.toString()
    //console.log(item);
    db.collection("users").find({ userid : user1 }).toArray(function(err, doc) {
        if (err) throw err;
        if(doc!=null){
            //console.log(doc)
            var cartarr =doc[0].cart;
            cartarr.push(item);
            console.log(cartarr);
            var myquery = { userid : user1 };
            var newvalues = { $set: { cart : cartarr } };
            db.collection("users").updateOne(myquery, newvalues, function(err, ress) {
              if (err) throw err;
              console.log("1 document updated");
              var query = {userid:user1};
              // console.log(query)
              db.collection("users").find(query).toArray(function(err, result) {
                  if (err) throw err;
                  //console.log(result[0].cart)
                  var totids=result[0].cart;
                  var newarr=[];
                  var total = 0;
                  db.collection('products').find({}).toArray(function(err, prod) {
                      if (err) throw err;
                      prod.forEach(element => {
                          if(totids.includes(element.itemid)){
                              newarr.push(element);
                              total+=element.amount;
                          }
                      });
                      console.log(newarr.length);
                      res.render('cart',{data:newarr,sum:total,userid : req.query.id,del:-1});
                  });
              });
            });
        }
    });
        
})

app.get('/vrmode', (req, res)=>{
    res.sendFile('public/html/vrindex.html', { root: __dirname });
})
app.get('/products', (req, res)=>{
    res.sendFile('public/html/products.html', { root: __dirname });
})
app.get('/samsungj7', (req, res)=>{
    res.sendFile('public/html/samsungj7.html', { root: __dirname });
})
app.get('/jblspeaker', (req, res)=>{
    res.sendFile('public/html/jblspeaker.html', { root: __dirname });
})
app.get('/sonytv', (req, res)=>{
    res.sendFile('public/html/sonytv.html', { root: __dirname });
})

app.get("/arview",(req,res) =>{
    res.sendFile('public/html/arview.html', { root: __dirname });
})

app.post('/compareitem',urlencoded,(req,res)=>{
    var user1 = req.query.id;
    console.log(user1);
    let globArr = [];
    let answ = user1.split(',');
    // console.log(answ);
    // console.log(answ[1]);
    var compids = [];
    compids.push(answ[1]);
    compids.push(answ[2]);
    var newarr=[];
    db.collection('products').find({}).toArray(function(err, prod) {
        if (err) throw err;
        prod.forEach(element => {
            if(compids.includes(element.itemid)){
                newarr.push(element);
            }
            
        });
        console.log(newarr);
        res.render('compare',{data:newarr});
    });
})

app.get('/cat', (req, res)=>{
    data=db.collection("products").find();
    db.collection("products").find({}).toArray(function(err, doc) {
        if (err) throw err;
        if(doc!=null){
        res.render('cat',{data:doc,data1:req.query.id});
        }   
    });
    // MongoClient.connect(url, function(err, db) {
    //     if (err) throw err;
    //     var dbo = db.db("shopping");
    //     dbo.collection("products").find({}).toArray(function(err, doc) {
    //       if (err) throw err;
    //         res.render('cat',{data:doc,data1:req.query.id});
    //     });
    //   });
});

var server = app.listen(process.env.PORT || 3000, function() { 
    console.log('listining to port 3000') 
});