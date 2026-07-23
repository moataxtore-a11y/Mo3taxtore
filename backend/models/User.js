const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

let bcryptInst;
try {
  bcryptInst = bcrypt.genSalt ? bcrypt : (bcrypt.default || bcrypt);
} catch (e) {
  bcryptInst = bcrypt;
}

const mapUserFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'student',
        grade: data.grade,
        phone: data.phone,
        avatar: data.avatar || '',
        isVerified: data.is_verified || false,
        verificationToken: data.verification_token,
        resetPasswordToken: data.reset_password_token,
        resetPasswordExpires: data.reset_password_expires,
        address: data.address || {},
        bio: data.bio,
        subject: data.subject,
        lastActive: data.last_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        comparePassword: async function(candidatePassword) {
            if (!this.password) return false;
            try {
                return await bcryptInst.compare(candidatePassword, this.password);
            } catch (err) {
                console.error('Password comparison failed:', err);
                return false;
            }
        }
    };
};

const mapUserToPg = (data) => {
    const pg = {};
    if (data.name !== undefined) pg.name = data.name;
    if (data.email !== undefined) pg.email = data.email;
    if (data.password !== undefined) pg.password = data.password;
    if (data.role !== undefined) pg.role = data.role;
    if (data.grade !== undefined) pg.grade = data.grade;
    if (data.phone !== undefined) pg.phone = data.phone;
    if (data.avatar !== undefined) pg.avatar = data.avatar;
    if (data.isVerified !== undefined) pg.is_verified = data.isVerified;
    if (data.verificationToken !== undefined) pg.verification_token = data.verificationToken;
    if (data.resetPasswordToken !== undefined) pg.reset_password_token = data.resetPasswordToken;
    if (data.resetPasswordExpires !== undefined) pg.reset_password_expires = data.resetPasswordExpires;
    if (data.address !== undefined) pg.address = data.address;
    if (data.bio !== undefined) pg.bio = data.bio;
    if (data.subject !== undefined) pg.subject = data.subject;
    if (data.lastActive !== undefined) pg.last_active = data.lastActive;
    return pg;
};

class User {
    static async findOne(query, selectFields) {
        let builder = supabase.from('users').select('*');
        if (query._id) builder = builder.eq('id', query._id);
        if (query.email) builder = builder.eq('email', query.email.toLowerCase());
        if (query.phone) builder = builder.eq('phone', query.phone);
        if (query.resetPasswordToken) builder = builder.eq('reset_password_token', query.resetPasswordToken);
        if (query.verificationToken) builder = builder.eq('verification_token', query.verificationToken);

        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        const userObj = mapUserFromPg(data);
        if (userObj) {
            userObj.select = function() { return this; };
            userObj.lean = function() { return this; };
        }
        return userObj;
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        const userObj = mapUserFromPg(data);
        if (userObj) {
            userObj.select = function() { return this; };
            userObj.lean = function() { return this; };
        }
        return userObj;
    }

    static async find(query = {}) {
        let builder = supabase.from('users').select('*');
        if (query.role) builder = builder.eq('role', query.role);
        if (query._id && Array.isArray(query._id.$in)) builder = builder.in('id', query._id.$in);
        builder = builder.order('created_at', { ascending: false });

        const { data, error } = await builder;
        if (error) throw error;
        return (data || []).map(mapUserFromPg);
    }

    static async create(userData) {
        const payload = mapUserToPg(userData);
        if (payload.password) {
            const salt = await bcryptInst.genSalt(12);
            payload.password = await bcryptInst.hash(payload.password, salt);
        }
        const { data, error } = await supabase.from('users').insert(payload).select().single();
        if (error) throw error;
        return mapUserFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const payload = mapUserToPg(updateData.$set || updateData);
        if (payload.password) {
            const salt = await bcryptInst.genSalt(12);
            payload.password = await bcryptInst.hash(payload.password, salt);
        }
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('users').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapUserFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('users').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapUserFromPg(data);
    }

    static async countDocuments(query = {}) {
        let builder = supabase.from('users').select('id', { count: 'exact', head: true });
        if (query.role) builder = builder.eq('role', query.role);
        const { count, error } = await builder;
        if (error) throw error;
        return count || 0;
    }
}

module.exports = User;