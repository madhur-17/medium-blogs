import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import {signUpInput,signInInput} from "@madhur17/medium";

export const userRouter= new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string
	},
 
}>();



userRouter.post('/signup', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
    
  const body=await c.req.json();
  const {success}=signUpInput.safeParse(body);
  if(success!){
    return c.text("error");
  }
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
  
  
  
  userRouter.post('/signin', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
    
  const body=await c.req.json();
  const {success}=signInInput.safeParse(body);
  if(success!){
    return c.text("error");
  }
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
  const token=await sign({id:user.id,email:user.email},c.env.JWT_SECRET)
  
  return c.json({
    token,
    success:true
  })
})