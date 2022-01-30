import express from "express";
import req from "express/lib/request";
import res from "express/lib/response";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
// import { path } from "express/lib/application";

// const articlesInfo =
// {
//     'learn-react':
//     {
//         upvotes:0,
//         comments: []
//     },
//     'learn-node':
//     {
//       upvotes:0,
//       comments: [],
//     },
//     'my-thoughts':
//     {
//         upvotes:0,
//         comments: []
//     }
// }
const app =express();
const path = require('path')
app.use(express.static(path.join(__dirname,'/build')));
// app.use (express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());
const withDB =async(opertaions,res)=>
{
    try
    {
        
        const client = await MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true});
        const db = client.db('myBlog');
        
        await opertaions(db);

        client.close();
    }catch(error)
    {
        res.status(500).json({message:'Error connecting to db',error});
    }
}
app.get('/api/articles/:name', async (req,res)=>{
    
    withDB(async(db)=>{
        const articleName= req.params.name;       
        const articlesInfo = await db.collection('articles').findOne({name:articleName})
        res.status(200).json(articlesInfo);
    },res)
   
})
//just for example:
// app.get('/hello',(req,res)=>res.send('Hello!'));
// app.get('/hello/:name',(req,res)=>res.send(`Hello ${req.body.name}!`))
// app.post('/hello',(req,res)=>res.send(`Hello  ${req.body.name}`));
//Actual code:
app.post('/api/articles/:name/upvote', async (req, res)=>{
    
   withDB(async(db)=>{
    const articleName= req.params.name;
   
    const articlesInfo =await db.collection('articles').findOne({name:articleName});

    await db.collection('articles').updateOne({name:articleName},
        {
            '$set':
            {
                upvotes:articlesInfo.upvotes+1,
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
   },res)
    
        
   
})
app.post('/api/articles/:name/add-comment',(req,res)=>{
    const {username,text} =req.body;
    const articleName= req.params.name;
    withDB(async(db)=>
    {
        debugger;
        const articlesInfo =await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name:articleName},
            {
                '$set':
                {
                    coments: articlesInfo.coments.concat({username,text})
                }
            })
            const updatedArticleInfo = await  db.collection('articles').findOne({name: articleName});
            res.status(200).json(updatedArticleInfo);
    },res);
});
app.get('*',(req,res)=>
{
    res.sendFile(path.join(__dirname + '/build/index.html'));
})
app.listen(8000,()=>console.log('Listening on port 8000'));