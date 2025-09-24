import { supabase } from '../supabaseClient.js';

export const createTask = async (req, res) => {
  const { workspace_id, title, description, status } = req.body;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ workspace_id, title, description, status }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTasks = async (req, res) => {
  const { workspace_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspace_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title, description, status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
