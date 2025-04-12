import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Get the path to the storylines.json file
    const dataDir = path.join(process.cwd(), 'src/data/narrative');
    const fileData = await fs.readFile(path.join(dataDir, 'storylines.json'), 'utf8');
    const data = JSON.parse(fileData);

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching storylines:', error);
    
    // If file not found/error reading, return basic default data
    return NextResponse.json({
      storylines: [
        {
          id: "classic_adventure",
          name: "Classic Adventure",
          description: "A standard adventuring quest with a balance of exploration, combat, and puzzles"
        }
      ]
    });
  }
}