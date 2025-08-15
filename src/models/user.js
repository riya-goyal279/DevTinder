const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value))
                throw new Error("Email is not valid");
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value))
                throw new Error("Password is not strong");
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if(!["male", "female", "others"].includes(value))
                throw new Error("Gender is not valid");
        }
    },
    imageUrl: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/0/03/Twitter_default_profile_400x400.png",
        validate(value) {
            if(!validator.isURL(value))
                throw new Error("Image Url is not valid");
        }
    },
    about: {
        type: String,
        default: "This is the default description of the user"
    },
    skills: {
        type: [String],
        validate(value) {
            if(value.length > 5)
                throw new Error("Maximum 5 skills allowed");
        }
    },
}, {
    timestamps: true,
});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id}, "DEV@Tinder$279", {expiresIn: "7d"});

    return token;
};

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const passwordStoredInDatabase = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordStoredInDatabase);

    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);