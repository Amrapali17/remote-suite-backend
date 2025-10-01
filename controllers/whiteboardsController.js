
import { supabase } from '../supabaseClient.js';

export const getWhiteboards = async (req, res) => {
  const { workspace_id } = req.query;
  const { data, error } = await supabase
    .from('whiteboards')
    .select('*')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createWhiteboard = async (req, res) => {
  const { workspace_id, name } = req.body;
  const { data, error } = await supabase
    .from('whiteboards')
    .insert([{ workspace_id, name }])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};

export const updateWhiteboard = async (req, res) => {
  const { id } = req.params;
  const { data: whiteboardData } = req.body;
  const { data, error } = await supabase
    .from('whiteboards')
    .update({ data: whiteboardData, updated_at: new Date() })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};

export const deleteWhiteboard = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('whiteboards')
    .delete()
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Whiteboard deleted successfully' });
};
