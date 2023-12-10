import express from 'express';

const router = express.Router();

// Mock data to store shopping lists
const lists = require("../list.json");
let nextId = 1; // Used to generate unique IDs for shopping lists



router.post('/', (req, res) => {
  const { listName, items } = req.body;

  // Validate that listName is present and not empty
  if (!listName || listName.trim() === '' || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid input. Both listName and items are required.' });
  }

  // Additional validation for empty items array
  if (items.length === 0) {
    return res.status(400).json({ error: 'Items array must not be empty.' });
  }

  // Additional validation for items array format
  const isValidItemsArray = items.every(item => item.name && typeof item.quantity === 'number');
  if (!isValidItemsArray) {
    return res.status(400).json({ error: 'Invalid items array format.' });
  }

  const newList = { id: nextId++, listName, items };
  lists.push(newList);
  res.json({ message: `List with the name ${newList.listName} added to the database!` });
});

// GET route to retrieve all lists
router.get('/', async (req, res) => {
  try {
    // Assuming there's no error in this synchronous operation
    if (lists.length === 0) {
      // Return an empty array if there are no lists
      return res.json([]);
    }

    // Return all shopping lists
    res.json(lists);
  } catch (error) {
    console.error(error.message); // Log the error

    // Set the response status to 500 for an error
    res.status(500).json({ error: 'Error fetching lists' });
  }
});

// GET route to retrieve a specific list by ID
router.get('/:id', (req, res) => {
  const listId = parseInt(req.params.id);

  // Check if the ID is a valid number
  if (isNaN(listId)) {
    return res.status(400).json({ message: 'Invalid list ID format' });
  }

  // Find the list with the provided ID, including archived lists
  const list = lists.find((list) => list.id === listId);

  if (list) {
    // List found, return it
    res.status(200).json(list);
  } else {
    // List not found, return 404
    res.status(404).json({ message: 'List not found' });
  }
});

// PUT route to update a specific list by ID
router.put('/:id', (req, res) => {
  const listId = parseInt(req.params.id);
  const { listName, items } = req.body;

  // Check if the ID is a valid number
  if (isNaN(listId)) {
    return res.status(400).json({ message: 'Invalid list ID format' });
  }

  // Validate that listName is present and not empty
  if (!listName || listName.trim() === '' || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid input. Both listName and items are required.' });
  }

  // Additional validation for empty items array
  if (items.length === 0) {
    return res.status(400).json({ error: 'Items array must not be empty.' });
  }

  // Additional validation for items array format
  const isValidItemsArray = items.every(item => item.name && typeof item.quantity === 'number');
  if (!isValidItemsArray) {
    return res.status(400).json({ error: 'Invalid items array format.' });
  }

  // Find the index of the list with the provided ID
  const index = lists.findIndex((list) => list.id === listId);

  if (index !== -1) {
    // Update the list
    lists[index] = { id: listId, listName, items };
    res.json({ message: `List with ID ${listId} updated in the database!` });
  } else {
    // List not found, return 404
    res.status(404).json({ message: 'List not found' });
  }
});

// DELETE route to delete a specific list by ID
router.delete('/:id', (req, res) => {
  const listId = parseInt(req.params.id);

  // Check if the ID is a valid number
  if (isNaN(listId)) {
    return res.status(400).json({ message: 'Invalid list ID format' });
  }

  // Find the index of the list with the provided ID
  const index = lists.findIndex((list) => list.id === listId);

  if (index !== -1) {
    // Remove the list
    lists.splice(index, 1);
    res.json({ message: `List with ID ${listId} deleted from the database!` });
  } else {
    // List not found, return 404
    res.status(404).json({ message: 'List not found' });
  }
});

export default router;