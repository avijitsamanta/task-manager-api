const express = require('express')
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth, async (req, res)=> {
    const task = new Task({
      ...req.body,
      owner:req.user._id
    })

    try{
        await task.save();
         res.status(201).send(task)
      }catch(e){
          res.status(400).send(e)
      }
   
  })

  router.get('/tasks',auth,async(req, res)=> {
    try{
      const match = {}
      const sort = {}
      if(req.query.completed !== undefined){

        match.completed = req.query.completed === 'true'
      }
      if(req.query.sortBy !== undefined){

        const parts = req.query.sortBy.split(':')

        sort[parts[0]] = parts[1] === 'desc' ? -1:1
      }
      await req.user.populate({
        path:"tasks",
        match,
        options:{
          limit:parseInt(req.query.limit),
          skip:parseInt(req.query.skip),
          sort

        }
      
      }).execPopulate()
        res.send(req.user.tasks)
      }catch(e){
        res.status(500).send(e)
      }
  })

  router.get('/tasks/:id',auth,  async(req, res)=> {
    const _id = req.params.id
    try{
        const task =await  Task.findOne({_id,owner:req.user._id});
        if(!task){
          res.status(404)
        }
        res.send(task)
      }catch(e){
        res.status(500).send(e)
      }
   
  })

  router.patch('/tasks/:id',auth,  async(req, res)=> {
    const updatekeys = Object.keys(req.body)
    const fillable = ['description','completed'];
    const isKeyExist = updatekeys.every((updatekey)=>{
      return fillable.includes(updatekey);
    })
    if(!isKeyExist){
      return res.status(404).send({'error':'Key is not permisable!'})
    }
    const _id = req.params.id
    try{
        const task = await Task.findById({_id,owner:req.user._id})

        if(!task){
          return res.status(404).send('not found')
      }

        updatekeys.forEach((update)=>{

          task[update] = req.body[update]

        })
        await task.save()
        //const task = await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
       
        res.send(task)
       }catch(e){
         res.status(500).send(e)
       }
   
  })

  router.delete('/tasks/:id',auth,async(req, res)=> {
    
    const _id = req.params.id
    try{
        const task = await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send('not found')
        }
        res.send(task)
       }catch(e){
         res.status(500).send(e)
       }
   
  })
module.exports = router