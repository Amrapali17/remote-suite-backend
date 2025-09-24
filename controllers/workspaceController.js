import { supabase } from '../supabaseClient.js';

export const createWorkspace = async (req, res) => {
  const { name, owner_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, owner_id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const { data, error } = await supabase.from('workspaces').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinWorkspace = async (req, res) => {
  const { workspace_id, user_id } = req.body;
  try {
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('members')
      .eq('id', workspace_id)
      .single();

    if (fetchError) throw fetchError;

    const members = workspace.members || [];
    if (!members.includes(user_id)) members.push(user_id);

    const { data, error: updateError } = await supabase
      .from('workspaces')
      .update({ members })
      .eq('id', workspace_id)
      .select();

    if (updateError) throw updateError;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const leaveWorkspace = async (req, res) => {
  const { workspace_id, user_id } = req.body;
  try {
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('members')
      .eq('id', workspace_id)
      .single();

    if (fetchError) throw fetchError;

    const members = (workspace.members || []).filter(id => id !== user_id);

    const { data, error: updateError } = await supabase
      .from('workspaces')
      .update({ members })
      .eq('id', workspace_id)
      .select();

    if (updateError) throw updateError;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
