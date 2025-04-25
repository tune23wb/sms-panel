import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destination, message, source_addr } = body;

        // Validate input
        if (!destination || !message) {
            console.error('Missing required fields:', { destination, message });
            return NextResponse.json(
                { error: 'Destination and message are required' },
                { status: 400 }
            );
        }

        // Path to the Python script
        const scriptPath = path.join(process.cwd(), 'services', 'smpp', 'smpp_service.py');
        console.log('Python script path:', scriptPath);

        // Check if script exists
        if (!fs.existsSync(scriptPath)) {
            console.error('Python script not found at:', scriptPath);
            return NextResponse.json(
                { error: 'SMS service script not found' },
                { status: 500 }
            );
        }

        // Try different Python executable names
        const pythonExecutables = ['python3', 'python', 'py'];
        let pythonProcess = null;
        let pythonError = null;

        for (const pythonExe of pythonExecutables) {
            try {
                pythonProcess = spawn(pythonExe, [
                    scriptPath,
                    '--destination', destination,
                    '--message', message,
                    '--source', source_addr || 'TestSMPP'
                ]);
                break;
            } catch (err) {
                pythonError = err;
                console.log(`Failed to spawn process with ${pythonExe}, trying next...`);
            }
        }

        if (!pythonProcess) {
            console.error('Failed to start Python process with any executable:', pythonError);
            return NextResponse.json(
                { error: 'Failed to start SMS service' },
                { status: 500 }
            );
        }

        // Create a promise to handle the Python script execution
        const sendSMS = new Promise((resolve, reject) => {
            console.log('Spawning Python process with args:', {
                destination,
                message: message.substring(0, 20) + '...', // Log first 20 chars for privacy
                source: source_addr || 'TestSMPP'
            });

            let output = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log('Python process output:', data.toString());
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
                console.error('Python process error:', data.toString());
            });

            pythonProcess.on('close', (code) => {
                console.log('Python process exited with code:', code);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Python script failed with code ${code}: ${error}`));
                }
            });

            // Handle process errors
            pythonProcess.on('error', (err) => {
                console.error('Failed to start Python process:', err);
                reject(new Error(`Failed to start Python process: ${err.message}`));
            });
        });

        // Execute the Python script
        const result = await sendSMS;
        console.log('SMS sent successfully:', result);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error sending SMS:', error);
        return NextResponse.json(
            { 
                error: 'Failed to send SMS',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 