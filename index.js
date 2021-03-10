require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
morgan.token('content', function (req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.get('/favicon.ico', (req, res) => res.status(204));
app.use(express.static('build'))
app.get('/', (request, response) => {
    response.send('<h1>Hello</h1>')
})

app.get('/info', (request, response) => {
    const time = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${time}</p>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
    
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body || !body.name || !body.number){
        return response.status(400).json({
            error: 'info missing'
        })
    }

    Person.find({name: body.name})
        .then(result => {
            if (Object.keys(result).length !== 0) {
                return response.json({
                    error: 'name must be unique'
                })
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number,
                })
                person.save().then(savedPerson => {
                    response.json(savedPerson)
                })
            }
        })
        .catch(error => {
            console.log(error)
            response.status(400).send({error: 'something went wrong'})
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})