import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, verify } from 'hono/jwt';


export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET:string
	},
    Variables:{
        userId:string;
    }
 
}>();

blogRouter.use("/*",async(c,next)=>{
    const head=c.req.header("Authorization")||"";
    const token=head.split(" ")[1];
   const payload=await verify(token,c.env.JWT_SECRET);
   if(payload){
     
     
    //const payload=decode(token);
    const userid=payload.id;
    //@ts-ignore
    c.set("userId",userid);
    await next();
 
   }
   else{
     return c.json({
       message:"Unathorized"
     })
   }
 })


blogRouter.post("/", async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();
    const authorId=c.get("userId")

    const post=await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId
        }
    })

    return c.json({
        "PostId":post.id
    })

})

blogRouter.put("/",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();

    const post=await prisma.post.update({
        where:{
            id:body.postId
        },
        data:{
            title:body.title,
            content:body.content,
          
        }
    })

    return c.json({
        Id:post.id
    })
})
blogRouter.get("/getall",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

   

    const post=await prisma.post.findMany();
        console.log(post);

    return c.json({
        post
    })
})
blogRouter.get("/:id",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const params= c.req.param('id');

    const post=await prisma.post.findUnique({
        where:{
            id:params
        },
    })
    

    return c.json({
        post
    })
})

blogRouter.get("/getall",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

   

    const post=await prisma.post.findMany();
        console.log(post);

    return c.json({
        post
    })
})



 
 