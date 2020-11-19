const express = require('express');

const multer  = require('multer')

const sharp = require('sharp');

const router = new express.Router()

const User = require('../models/user')

const { welcomeMail,goodbyeMail } = require('../emails/account')

const auth = require('../middleware/auth')



router.post('/users',  async(req, res) => {
    const user = new User(req.body)
    try{
      await user.save();
      welcomeMail(user.email,user.name)
      const token = await user.generateAuthToken()
       res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
  })

  router.post('/users/login',  async(req, res) => {
    try{
      
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
       res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
  })

  router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {

      req.user.tokens = []

      await req.user.save()

      res.send()
  } catch (e) {
      res.status(500).send()
  }
})


  router.get('/users/me',auth,  async(req, res) => {

        res.send(req.user)
     
   
  })

  const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  
  const buffer = await sharp(req.file.buffer).resize({width:320, height:240}).png().toBuffer()
  
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

  router.get('/users/:id',  async(req, res)=> {
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send('not found')
        }
        res.send(user)
       }catch(e){
         res.status(500).send(e)
       }
   
  })
  router.get('/users/:id/avatar',  async(req, res)=> {
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user || !user.avatar){
            return res.status(404).send('not found')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
       }catch(e){
         res.status(500).send(e)
       }
   
  })
  router.patch('/users',auth, async(req, res)=> {
    const updatekeys = Object.keys(req.body)
    const fillable = ['age','name','email','password'];
    const isKeyExist = updatekeys.every((updatekey)=>{
      return fillable.includes(updatekey);
    })
    if(!isKeyExist){
      return res.status(404).send({'error':'Key is not permisable!'})
    }
   
    try{
       
        updatekeys.forEach((update)=>{

          req.user[update] = req.body[update]
        })

        await req.user.save()
        
        res.send(req.user)
       }catch(e){
         res.status(500).send(e)
       }
   
  })

  router.delete('/users/me', auth, async(req, res)=> {
    
    const _id = req.user._id
    try{
       await req.user.remove()
       goodbyeMail(req.user.email,req.user.name)
        res.send(req.user)
       }catch(e){
         res.status(500).send(e)
       }
   
  })
module.exports = router