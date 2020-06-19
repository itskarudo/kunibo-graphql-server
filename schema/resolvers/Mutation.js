const User = require('../../models/User');
const Book = require('../../models/Book');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

const registerSchema = Joi.object({
    username: Joi.string()
                .alphanum()
                .min(4)
                .max(20)
                .required(),
    email: Joi.string()
                .email({ minDomainSegments: 2 }),
    password: Joi.string()
                .min(8).max(30)
                .required(),
    password2: Joi.any()
                .valid(Joi.ref('password'))
                .required()

});

const hashPass = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt)
    return hashedPass;
}

module.exports = {
    register: async (parent, args) => {
        const { username, email, password, password2 } = args;

        // validate the data using Joi
        const { error } = registerSchema.validate({ username, email, password, password2 });

        if (error) throw error;

        // Check if username or email are already used
        let sameUsernameOrEmail;
        try {
            sameUsernameOrEmail = await User.findOne({ $or: [{username}, {email}] });
        } catch(e) {
            throw new Error("An error has accured");
        }

        if (sameUsernameOrEmail) {
            
            if (sameUsernameOrEmail.username === username)
                throw new Error("Username already registered")
            else if (sameUsernameOrEmail.email === email)
            throw new Error("Email already registered")

        }

        // if it passes all the tests:

        const hashedPass = await hashPass(password);

        let user;
        try {
            user = new User({ username, email, password: hashedPass });
        } catch(e) {
            throw new Error("An error has accured");
        }

        await user.save();


        return { ...user._doc, password: null, _id: user.id };
    },
    addBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        const {name, author, year, cover} = args;

        let book;
        try {
            book = new Book({
                name, author, year, cover, ownerId: userId
            });
        } catch(e) {
            throw new Error("An error has accured");
        }

        await book.save();

        return book;

    },
    removeBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        let book;
        try {
            book = await Book.findOneAndDelete({ $and: [{ ownerId: userId }, { _id: args.id }] });
        } catch (e) {
            throw new Error("Book not found");
        }
        return book;
    }
}