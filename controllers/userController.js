const bcrypt = require('bcryptjs');
const supabase = require('../supabaseClient');
const { canManage } = require('../utils/roleValidator');

// Create a user
const createUser = async (req, res) => {
    const { name, full_name, password, role } = req.body;  // ✅ added full_name
    const currentUserRole = req.user.role;

    // Role validation
    if (!canManage(currentUserRole, role)) {
        return res.status(403).send('You are not authorized to create this role');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Supabase
    const { data, error } = await supabase.from('users').insert([
        {
            name,                          // username
            full_name,                     // ✅ store full name
            password: hashedPassword,
            role,
            status: role === "cardadmin" ? true : false
        },
    ]);

    if (error) return res.status(500).json({ error: 'Error creating user' });

    res.status(201).json({ message: 'User created successfully', data });
};

// Delete a user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const currentUserRole = req.user.role;

    // Fetch the role of the user to be deleted
    const { data, error } = await supabase.from('users').select('role').eq('id', id).single();
    if (error || !data) return res.status(404).send('User not found');

    const targetRole = data.role;

    // Role validation
    if (!canManage(currentUserRole, targetRole)) {
        return res.status(403).send('You are not authorized to delete this role');
    }

    // Delete user
    const { error: deleteError } = await supabase.from('users').delete().eq('id', id);
    if (deleteError) return res.status(500).json({ error: 'Error deleting user' });

    res.status(200).json({ message: 'User deleted successfully' });
};

// Edit a user
const editUser = async (req, res) => {
    const { id } = req.params;
    const { name, full_name, password } = req.body;  // ✅ added full_name
    const currentUserRole = req.user.role;

    // Fetch the user to be edited
    const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !userData) {
        return res.status(404).send('User not found');
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;          // username
    if (full_name) updateData.full_name = full_name;  // ✅ update full name
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

    if (error) {
        return res.status(500).json({ error: 'Error updating user' });
    }

    res.status(200).json({ message: 'User updated successfully' });
};

module.exports = { createUser, deleteUser, editUser };
