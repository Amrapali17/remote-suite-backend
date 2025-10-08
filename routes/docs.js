import express from 'express';
import fileUpload from 'express-fileupload';
import {
  getDocs,
  createDoc,
  updateDoc,
  deleteDoc,
  saveDocSnapshot,
  uploadDocFile,
  deleteDocFile
} from '../controllers/docsController.js';

const router = express.Router();

router.use(fileUpload());


router.get('/', getDocs);
router.post('/create', createDoc);
router.put('/:doc_id', updateDoc);
router.delete('/:doc_id', deleteDoc);


router.post('/:doc_id/save', async (req, res) => {
  const { doc_id } = req.params;
  const { content } = req.body;
  try {
    await saveDocSnapshot(doc_id, content);
    res.json({ message: 'Snapshot saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:doc_id/upload', uploadDocFile);
router.delete('/:doc_id/file', deleteDocFile);

export default router;
