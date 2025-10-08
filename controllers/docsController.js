import { supabase } from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export const getDocs = async (req, res) => {
  const { workspace_id } = req.query;
  try {

    const { data: docs, error: docsError } = await supabase
      .from('docs')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: true });

    if (docsError) return res.status(400).json({ error: docsError.message });

    const docIds = docs.map(doc => doc.id);
    const { data: files, error: filesError } = await supabase
      .from('doc_files')
      .select('*')
      .in('doc_id', docIds);

    if (filesError) return res.status(400).json({ error: filesError.message });


    const docsWithFiles = docs.map(doc => ({
      ...doc,
      files: files.filter(f => f.doc_id === doc.id)
    }));

    res.json(docsWithFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createDoc = async (req, res) => {
  const { workspace_id, title, content } = req.body;
  try {
    const { data, error } = await supabase
      .from('docs')
      .insert([{ workspace_id, title, content }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateDoc = async (req, res) => {
  const { doc_id } = req.params;
  const { title, content } = req.body;
  try {
    const updateObj = {};
    if (title !== undefined) updateObj.title = title;
    if (content !== undefined) updateObj.content = content;
    updateObj.updated_at = new Date();

    const { data, error } = await supabase
      .from('docs')
      .update(updateObj)
      .eq('id', doc_id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteDoc = async (req, res) => {
  const { doc_id } = req.params;
  try {

    const { data: files } = await supabase
      .from('doc_files')
      .select('*')
      .eq('doc_id', doc_id);

    if (files?.length) {
      const filePaths = files.map(f => f.file_url.split('/').pop());
      await supabase.storage.from('docs-files').remove(filePaths);
      await supabase.from('doc_files').delete().eq('doc_id', doc_id);
    }


    const { error } = await supabase.from('docs').delete().eq('id', doc_id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Doc deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveDocSnapshot = async (doc_id, content) => {
  try {
    await supabase
      .from('docs')
      .update({ content, updated_at: new Date() })
      .eq('id', doc_id);
  } catch (err) {
    console.error('Error saving Yjs snapshot:', err.message);
  }
};

export const uploadDocFile = async (req, res) => {
  const { doc_id } = req.params;
  if (!req.files || !req.files.file)
    return res.status(400).json({ error: 'No file uploaded' });

  try {
    const file = req.files.file;
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;


    const { error: uploadError } = await supabase.storage
      .from('docs-files')
      .upload(fileName, file.data, {
        contentType: file.mimetype,
        upsert: true,
      });
    if (uploadError) return res.status(400).json({ error: uploadError.message });


    const { data: publicData } = supabase.storage
      .from('docs-files')
      .getPublicUrl(fileName);
    const publicUrl = publicData?.publicUrl;


    const { data: fileData, error: fileError } = await supabase
      .from('doc_files')
      .insert([{
        doc_id,
        name: file.name,
        file_url: publicUrl,
        file_type: file.mimetype,
        file_size: file.size,
      }])
      .select();

    if (fileError) return res.status(400).json({ error: fileError.message });
    res.json({ message: 'File uploaded successfully', file: fileData[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDocFile = async (req, res) => {
  const { file_id } = req.params;
  try {
    const { data: fileData, error: fileError } = await supabase
      .from('doc_files')
      .select('*')
      .eq('id', file_id)
      .single();

    if (fileError || !fileData) return res.status(404).json({ error: 'File not found' });


    const filePath = fileData.file_url.split('/').pop();
    await supabase.storage.from('docs-files').remove([filePath]);


    const { error: deleteError } = await supabase
      .from('doc_files')
      .delete()
      .eq('id', file_id);
    if (deleteError) return res.status(400).json({ error: deleteError.message });

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
