
import { supabase } from '../supabaseClient.js';

export const getNotifications = async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createNotification = async (req, res) => {
  const { user_id, workspace_id, type, message, link } = req.body;
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ user_id, workspace_id, type, message, link }])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};
