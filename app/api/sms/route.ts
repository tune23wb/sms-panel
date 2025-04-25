import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destination, message, source_addr } = body;

        // Validate input
        if (!destination || !message) {
            return NextResponse.json(
                { error: 'Destination and message are required' },
                { status: 400 }
            );
        }

        // Path to the Python script
        const scriptPath = path.join(process.cwd(), 'services', 'smpp', 'smpp_service.py');

        // Create a promise to handle the Python script execution
        const sendSMS = new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', [
                scriptPath,
                '--destination', destination,
                '--message', message,
                '--source', source_addr || 'TestSMPP'
            ]);

            let output = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Python script failed: ${error}`));
                }
            });
        });

        // Execute the Python script
        const result = await sendSMS;

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error sending SMS:', error);
        return NextResponse.json(
            { error: 'Failed to send SMS' },
            { status: 500 }
        );
    }
} 