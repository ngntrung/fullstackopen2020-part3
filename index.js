require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
// eslint-disable-next-line no-unused-vars
morgan.token('content', function (req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.get('/favicon.ico', (req, res) => res.status(204))
app.use(express.static('build'))

const errorHandler = (error, request, response, next) => {
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError'){
		return response.status(400).json({error: error.message})
	}
  
	next(error)
}

app.get('/info', (request, response, next) => {
	const time = new Date()
	Person.find({})
		.then(result =>
			response.send(`<p>Phonebook has info for ${result.length} people</p> <p>${time}</p>`)
		)
		.catch(error => next(error))

})

app.get('/api/persons', (request, response, next) => {
	Person.find({})
		.then(result => {
			response.json(result)
		})
		.catch(error => next(error))
    
})

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			response.json(person)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
	const body = request.body

	const person = new Person({
		name: body.name,
		number: body.number,
	})
	person.save()
		.then(savedPerson => response.json(savedPerson))
		.catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(request.params.id, person, {new: true})
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.use(errorHandler)
// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})