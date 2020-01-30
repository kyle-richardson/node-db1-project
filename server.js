const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

server.get('/', (req, res)=> {
    res.json({message: 'API Working.  use /api/accounts to find list of accounts'})
})
server.get('/api', (req, res)=> {
    res.json({message: 'API Working.  use /api/accounts to find list of accounts'})
})

server.get('/api/accounts/', (req, res) =>{
    db('accounts')
        .then(accounts=> {
            if(accounts)
                res.status(200).json(accounts)
            else
                res.status(400).json({error: "There are no accounts"})
        })
        .catch(err=> {
            res.status(500).json({error: "server failed to retrieve account list"})
        })
})

server.post('/api/accounts/', validateNewAccount, (req, res)=> {
    const newAccount = req.body
    db('accounts').insert(newAccount)
        .then(promise => {
            res.status(200).json(promise)
        })
        .catch(err=> {
            res.status(500).json( {error: 'Could not add new account to server. Server error'})
        })
})

server.put('/api/accounts/:id', validateAccountId, validateChanges, (req, res) => {
    const {id} = req.params
    const changes = req.body
    db('accounts').where({id: id}).update(changes)
        .then(promise => {
            if(promise >0)
                res.status(200).json({message: 'Success.  Account changed'})
            else
                res.status(400).json({error: 'Error occured.  No account found to update'})
        })
        .catch(err=> {
            res.status(500).json({error: 'Server error; could not make changes'})
        })
})

server.delete('/api/accounts/:id', validateAccountId, (req, res) => {
    const {id} = req.params
    db('accounts').where({id: id}).del()
        .then(promise=> {
            if(promise >0)
                res.status(200).json({message: 'Success.  Account deleted'})
            else
                res.status(400).json({error: 'Error occured.  No account found to delete'})
        })
        .catch(err=> {
            res.status(500).json({error: 'Server error; could not delete account'})
        })
})

function validateChanges(req,res,next){
    const changes = req.body
    if(changes.name) {
        db('accounts').where({name: changes.name})
        .then(promise=> {
            if(promise.length>0)
                res.status(400).json({error: 'Name already in use. Please choose another name.'})
            else
                next()
        })
        .catch(err=> {
            res.status(500).json({error: 'server error'})
        })
    }
    else
        next()
}

function  validateNewAccount(req, res, next){
    const body = req.body
    if(body.name && body.budget) {
        db('accounts').where({name: body.name})
            .then(promise=> {
                if(promise.length>0)
                    res.status(400).json({error: 'Name already in use. Please choose another name.'})
                else
                    next()
            })
            .catch(err=> {
                res.status(500).json({error: 'server error'})
            })
    }
    else
        res.status(400).json({error: 'Name and Budget fields required.'})
}

function validateAccountId(req, res, next) {
    const {id} = req.params
    db('accounts').where({id: id})
        .then(account=> {
            if(account.length > 0)
                next()
            else
                res.status(400).json({error: 'Invalid account id'})
        })
        .catch(err=> {
            res.status(500).json({error: 'server error'})
        })
}

module.exports = server;