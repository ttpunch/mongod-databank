# MongoDB Excel Data API (mongod-databank)

A MongoDB-based system for handling Excel-like data with a RESTful API.

## Features

- Create, read, update, and delete Excel-like sheets
- Flexible schema for different data types
- Row-based operations for data manipulation
- RESTful API for easy integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env` file (already set up with default values)

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Sheets

- `GET /api/data/sheets` - Get all sheets
- `POST /api/data/sheets` - Create a new sheet
- `GET /api/data/sheets/:id` - Get a specific sheet
- `PUT /api/data/sheets/:id` - Update sheet properties
- `DELETE /api/data/sheets/:id` - Delete a sheet

### Rows

- `POST /api/data/sheets/:id/rows` - Add a row to a sheet
- `PUT /api/data/sheets/:sheetId/rows/:rowId` - Update a specific row
- `DELETE /api/data/sheets/:sheetId/rows/:rowId` - Delete a specific row

## Example Usage

### Creating a new sheet

```bash
curl -X POST http://localhost:3000/api/data/sheets \
  -H "Content-Type: application/json" \
  -d '{"sheetName": "Sales Data", "columns": [{"name": "Product", "type": "string"}, {"name": "Quantity", "type": "number"}, {"name": "Date", "type": "date"}]}'
```

### Adding a row to a sheet

```bash
curl -X POST http://localhost:3000/api/data/sheets/[sheet-id]/rows \
  -H "Content-Type: application/json" \
  -d '{"data": {"Product": "Laptop", "Quantity": 5, "Date": "2023-12-15"}}'
```

## License

ISC
