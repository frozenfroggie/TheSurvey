const Survey = require('../models/Surveys');
const { Types: { ObjectId } } = require('mongoose');
const Joi = require('joi');

function validateSurvey(survey) {
    const schema = {
        title: Joi.string().min(3).max(255).required(),
        question: Joi.string().min(5).max(255).required(),
        answer: Joi.date().required(),
    };
    return Joi.validate(survey, schema)
}

module.exports = {
    index: async (req, res) => {
        const surveys = await Survey.find().sort('title');
        res.send(surveys);
    },

    create: async (req, res) => {
        const { error } = validateSurvey(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        const duplicate = await Survey.findOne({title: req.body.title});
        if (duplicate)
            return res.status(400).send('Survey already exists');

        const survey = new Survey({
            title: req.body.title,
            question: req.body.question,
            answer: req.body.answer,
        });
        await survey.save();
        res.send(survey)
    },

    view: async (req, res) => {
        const id = req.params.id
        const isValidObjectId = ObjectId.isValid(id)
        if (!isValidObjectId)
            return res.status(400).send('Survey ID is not valid');

        const survey = await Survey.findById(id);
        if (!survey)
            return res.status(404).send('The survey with the given ID was not found');

        res.send(survey);
    },

    edit: async (req, res) => {
        const id = req.params.id
        const isValidObjectId = ObjectId.isValid(id)
        if (!isValidObjectId)
            return res.status(400).send('Survey ID is not valid');

        const { error } = validateSurvey(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        const survey = await Survey.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            question: req.body.question,
            answer: req.body.answer,
        }, { new: true });
        if (!survey)
            return res.status(404).send('The survey with the given ID was not found');

        res.send(survey);
    },

    delete: async (req, res) => {
        const id = req.params.id
        const isValidObjectId = ObjectId.isValid(id)
        if (!isValidObjectId)
            return res.status(400).send('Survey ID is not valid');

        const survey = await Survey.findByIdAndRemove(req.params.id);
        if (!survey)
            return res.status(404).send('The survey with the given ID was not found');

        res.send(survey);
    },
};
