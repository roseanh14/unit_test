import request from 'supertest';
import server from '../server.js';

const lists = [];
let nextId = 1; // Used to generate unique IDs for shopping lists

beforeEach(() => {
  // Clear the lists array before each test
  lists.length = 0;
});

afterAll(() => {
  // Close the server after all tests are done
  server.close();
});


describe('List Routes', () => {
  test('POST /lists - Create a new list', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        listName: 'Grocery List',
        items: [
          { name: 'Apple', quantity: 5 },
          { name: 'Banana', quantity: 3 },
          { name: 'Milk', quantity: 2 },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('added to the database');
  });

  test('POST /lists - Handle invalid data', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        // Invalid payload with missing required fields
      });

    // Check if the response status is in the 4xx range
    if (response.status >= 400 && response.status < 500) {
      // Check if the response body contains an error property
      expect(response.body.error).toBeDefined();
    } else {
      // If the status code is not in the 4xx range, the response body error should be undefined
      expect(response.body.error).toBeUndefined();
    }

    // Check if the response status is 400 for intentionally handled invalid data
    expect(response.status).toBe(400);
  });

  test('POST /lists - Handle missing listName field', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        // Missing the required listName field
        items: [
          { name: 'Apple', quantity: 5 },
          { name: 'Banana', quantity: 3 },
          { name: 'Milk', quantity: 2 },
        ],
      });

    // Check if the response status is in the 4xx range
    if (response.status >= 400 && response.status < 500) {
      // Check if the response body contains an error property
      expect(response.body.error).toBeDefined();
    } else {
      // If the status code is not in the 4xx range, the response body error should be undefined
      expect(response.body.error).toBeUndefined();
    }

    // Check if the response status is 400 for intentionally handled missing listName field
    expect(response.status).toBe(400);
  });

  test('POST /lists - Handle empty list', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        listName: 'Empty List',
        items: [],
      });

    // Check if the response status is 400 for intentionally handled empty list
    expect(response.status).toBe(400);
    // Check if the response body contains an error property
    expect(response.body.error).toBeDefined();
  });

  test('POST /lists - Handle invalid quantity in items', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        listName: 'Invalid Quantity List',
        items: [
          { name: 'Apple', quantity: 'five' }, // Invalid quantity value
          { name: 'Banana', quantity: 3 },
          { name: 'Milk', quantity: 2 },
        ],
      });

    // Check if the response status is 400 for invalid quantity
    expect(response.status).toBe(400);
    // Check if the response body contains an error property
    expect(response.body.error).toBeDefined();
  });

  test('GET /lists - Get all lists (Original test case)', async () => {
    // Original test case
    lists.push({
      id: 1,
      listName: 'Grocery List',
      items: [
        { name: 'Apple', quantity: 5 },
        { name: 'Banana', quantity: 3 },
        { name: 'Milk', quantity: 2 },
      ],
      archived: false,
    });
  
    const response = await request(server).get('/lists');
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(lists.length);
  });
  
  describe('GET /lists/:id - Get a specific list', () => {
    let lists;
    let nextId;
  
    beforeEach(() => {
      // Initialize the lists array and nextId before each test
      lists = [];
      nextId = 1;
    });
  
    test('should return a specific list when a valid ID is provided', async () => {
      // Add the list with ID 1 to the lists array
      lists.push({ id: 1, listName: 'Grocery List', items: [], archived: false });
    
      const response = await request(server).get('/lists/1');
    
    
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.listName).toBe('Grocery List');
    });

    test('should return a 404 error when the list is not found', async () => {
      const notFoundResponse = await request(server).get('/lists/99');
  
      expect(notFoundResponse.status).toBe(404);
      expect(notFoundResponse.body.message).toContain('List not found');
    });
  
    test('should return a 400 error for an invalid ID format', async () => {
      const invalidIdResponse = await request(server).get('/lists/invalidId');
  
      expect(invalidIdResponse.status).toBe(400);
      expect(invalidIdResponse.body.message).toContain('Invalid list ID format');
    });
  });

  test('PUT /lists/:id - Update a specific list', async () => {
    // Original test case
    lists.push({ id: 1, listName: 'Grocery List', items: [], archived: false });
  
    const response = await request(server)
      .put('/lists/1')
      .send({
        listName: 'Updated Grocery List',
        items: [
          { name: 'New Item 1', quantity: 3 },
          { name: 'New Item 2', quantity: 2 },
        ],
      });
  
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('updated in the database');
  });
  
  test('PUT /lists/:id - Update a non-existing list', async () => {
    // Alternative scenario: List Not Found
    const notFoundResponse = await request(server)
      .put('/lists/99')
      .send({
        listName: 'Updated Grocery List',
        items: [
          { name: 'New Item 1', quantity: 3 },
          { name: 'New Item 2', quantity: 2 },
        ],
      });
    expect(notFoundResponse.status).toBe(404);
    expect(notFoundResponse.body.message).toContain('List not found');
  });
  
  test('PUT /lists/:id - Update with an invalid ID format', async () => {
    // Alternative scenario: Invalid ID Format
    const invalidIdResponse = await request(server)
      .put('/lists/invalidId')
      .send({
        listName: 'Updated Grocery List',
        items: [
          { name: 'New Item 1', quantity: 3 },
          { name: 'New Item 2', quantity: 2 },
        ],
      });
    expect(invalidIdResponse.status).toBe(400);
    expect(invalidIdResponse.body.message).toContain('Invalid list ID format');
  });
  
  test('DELETE /lists/:id - Delete a specific list', async () => {
    // Original test case
    lists.push({ id: 1, listName: 'Grocery List', items: [], archived: false });
  
    const response = await request(server).delete('/lists/1');
  
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('deleted from the database');
  });
  
  test('DELETE /lists/:id - Delete a non-existing list', async () => {
    // Alternative scenario: List Not Found
    const notFoundResponse = await request(server).delete('/lists/99');
    expect(notFoundResponse.status).toBe(404);
    expect(notFoundResponse.body.message).toContain('List not found');
  });
  
  test('DELETE /lists/:id - Delete with an invalid ID format', async () => {
    // Alternative scenario: Invalid ID Format
    const invalidIdResponse = await request(server).delete('/lists/invalidId');
    expect(invalidIdResponse.status).toBe(400);
    expect(invalidIdResponse.body.message).toContain('Invalid list ID format');
  });


  test('POST /lists - Handle incomplete item data', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        listName: 'Incomplete Item List',
        items: [
          { name: 'Apple', quantity: 5 },
          { name: 'Banana' }, // Missing quantity field
        ],
      });
  
    // Check if the response status is 400 for incomplete item data
    expect(response.status).toBe(400);
    // Check if the response body contains an error property
    expect(response.body.error).toBeDefined();
  });
  test('POST /lists - Handle invalid item format', async () => {
    const response = await request(server)
      .post('/lists')
      .send({
        listName: 'Invalid Item Format List',
        items: [
          { name: 'Apple', quantity: 5 },
          { name: 'Banana', quantity: 'three' }, // Invalid quantity format
        ],
      });
  
    // Check if the response status is 400 for invalid item format
    expect(response.status).toBe(400);
    // Check if the response body contains an error property
    expect(response.body.error).toBeDefined();
  });




  test('GET /lists - Get all lists with an empty database', async () => {
    // Reset the lists array to simulate an empty database
    lists.length = 0;
  
    const response = await request(server).get('/lists');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });


  test('GET /lists/:id - Get a specific list with an archived status', async () => {
    // Add an archived list with ID 2 to the lists array (ID 1 is the Grocery List)
    lists.push({ id: 2, listName: 'Archived List', items: [], archived: true });
  
    const response = await request(server).get('/lists/2');
  
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('List not found');
  });


  test('PUT /lists/:id - Update a specific list with incomplete data', async () => {
    // Add a list with ID 1 to the lists array
    lists.push({ id: 1, listName: 'Incomplete Update List', items: [], archived: false });
  
    const response = await request(server)
      .put('/lists/1')
      .send({
        // Missing listName field
        items: [
          { name: 'Updated Item 1', quantity: 3 },
          { name: 'Updated Item 2', quantity: 2 },
        ],
      });
  
    // Check if the response status is 400 for incomplete data
    expect(response.status).toBe(400);
    // Check if the response body contains an error property
    expect(response.body.error).toBeDefined();
  });
  test('DELETE /lists/:id - Delete a specific list with an archived status', async () => {
    // Add an archived list with ID 1 to the lists array
    lists.push({ id: 1, listName: 'Archived List', items: [], archived: true });
  
    const response = await request(server).delete('/lists/1');
  
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('List not found');
  });

});
    