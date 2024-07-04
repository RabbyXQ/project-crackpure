import { NextApiRequest, NextApiResponse } from 'next';
import connection from '../../../../../utils/db'; // Adjust the path if necessary

// Function to fetch category details by cat_id
const getCategoryById = async (cat_id: string) => {
  try {
    const [rows] = await connection.query('SELECT * FROM category WHERE cat_id = ?', [cat_id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { cat_id } = req.query;

      // Ensure `cat_id` is a string and present
      if (typeof cat_id !== 'string') {
        return res.status(400).json({ error: 'Invalid cat_id' });
      }

      const category = await getCategoryById(cat_id);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
