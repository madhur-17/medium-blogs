import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,sign,verify } from 'hono/jwt';


const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string
	},
 
}>();

app.use("/api/v1/blog/*",async(c,next)=>{
   const head=c.req.header("Authorization")||"";
   const token=head.split(" ")[1];
  const res=await verify(token,c.env.JWT_SECRET);
  if(res.id){
    
    
    await next()

  }
  else{
    return c.json({
      message:"Unathorized"
    })
  }
})


app.post('/api/v1/signup', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  
const body=await c.req.json();
const user=await prisma.user.create({
  data:{
    email:body.email,
    password:body.password,
  }


})

  return c.json({
    success:true,
    message:"Signed Up Successfully"
  })
})



app.post('/api/v1/signin', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  
const body=await c.req.json();
const user=await prisma.user.findUnique({
  where:{
    email:body.email,
    password:body.password,
  }
})
if(!user){
   c.status(400)
   return c.json({
    success:false,
    message:"enter correct details"
   })
}
const token=sign({id:user.id,email:user.email},c.env.JWT_SECRET)

return c.json({
  token,
  success:true
})

})
app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
