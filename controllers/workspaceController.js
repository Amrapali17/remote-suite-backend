
import { supabase } from "../supabaseClient.js";


export const createWorkspace = async (req, res) => {
  const { name, owner_id } = req.body;
  if (!name || !owner_id) {
    return res.status(400).json({ error: "Name and owner_id are required" });
  }

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .insert([{ name, owner_id, members: [owner_id] }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getWorkspaces = async (req, res) => {
  try {
    const { data, error } = await supabase.from("workspaces").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getWorkspaceById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteWorkspace = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Workspace deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const joinWorkspace = async (req, res) => {
  const { workspace_id, user_id } = req.body;
  try {
    const { data: workspace, error: fetchError } = await supabase
      .from("workspaces")
      .select("members")
      .eq("id", workspace_id)
      .single();
    if (fetchError) throw fetchError;

    const members = workspace.members || [];
    if (!members.includes(user_id)) members.push(user_id);

    const { data, error: updateError } = await supabase
      .from("workspaces")
      .update({ members })
      .eq("id", workspace_id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const leaveWorkspace = async (req, res) => {
  const { workspace_id, user_id } = req.body;
  try {
    const { data: workspace, error: fetchError } = await supabase
      .from("workspaces")
      .select("members")
      .eq("id", workspace_id)
      .single();
    if (fetchError) throw fetchError;

    const members = (workspace.members || []).filter(id => id !== user_id);

    const { data, error: updateError } = await supabase
      .from("workspaces")
      .update({ members })
      .eq("id", workspace_id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
