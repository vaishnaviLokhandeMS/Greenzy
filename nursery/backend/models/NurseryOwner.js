const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NurseryOwnerSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    phonenumber: { type: String, required: true, unique: true },
    nurseryname: { type: String, required: true },
    nurseryaddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    owneraddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    email: { type: String, required: true, unique: true },
    registrationdate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminremarks: String,
    userid: { type: String},
    username: { type: String, unique: true },
    password: { type: String, required: true },
    approvedby: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedat: { type: Date }
});

NurseryOwnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Generate unique userid if not already present
    if (!this.userid) {
        this.userid = 'USR' + Math.floor(100000 + Math.random() * 900000); // Example: USR123456
    }

    next();
});


module.exports = mongoose.model('nursery_owners', NurseryOwnerSchema);
