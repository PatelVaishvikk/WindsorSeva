// // File: pages/api/call-logs/index.js

// import connectDb from '../../../config/db'; // Adjust path if necessary (e.g., '../../lib/db')
// import CallLog from '../../../models/CallLog'; // Adjust path if necessary (e.g., '../../models/CallLog')
// import Student from '../../../models/Student'; // Adjust path if necessary (e.g., '../../models/Student')
// import mongoose from 'mongoose'; // Import mongoose if you need ObjectId validation

// export default async function handler(req, res) {
//     // Ensure DB connection
//     try {
//         await connectDb();
//     } catch (error) {
//         console.error('!!! Database Connection Error:', error);
//         return res.status(503).json({ error: 'Database connection failed', details: error.message });
//     }


//     // --- Handle GET Requests (Fetching Call Logs) ---
//     if (req.method === 'GET') {
//         console.log('\n--- [API GET /api/call-logs] ---'); // Log start of request
//         console.log('Request Query Parameters:', req.query); // Log raw query params

//         const { page = 1, limit = 10, search = '' } = req.query;

//         // Validate and parse pagination parameters
//         const pageNumber = parseInt(page, 10);
//         let limitNumber = parseInt(limit, 10); // Use let if you might cap it

//         // Cap the limit to a reasonable maximum (e.g., 100)
//         const MAX_LIMIT = 100;
//         if (limitNumber > MAX_LIMIT) {
//             console.warn(`Requested limit ${limitNumber} exceeds maximum ${MAX_LIMIT}. Capping limit.`);
//             limitNumber = MAX_LIMIT;
//         }


//         console.log(`Parsed Params: page=${pageNumber}, limit=${limitNumber}, search='${search}'`);

//         // Basic validation for pagination numbers
//         if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
//             console.error('Validation Error: Invalid page or limit parameters received.');
//              console.log('------------------------\n');
//             return res.status(400).json({ error: 'Invalid page or limit parameters. Page and limit must be positive integers.' });
//         }

//         // Calculate the number of documents to skip
//         const skip = (pageNumber - 1) * limitNumber;
//         console.log(`Calculated Skip: ${skip}`);

//         try {
//             // --- Build Search Filter ---
//             let filter = {};
//             const trimmedSearch = search.trim(); // Trim search term once

//             if (trimmedSearch) {
//                 console.log(`Building search filter for term: "${trimmedSearch}"`);
//                 const regex = new RegExp(trimmedSearch, 'i'); // Case-insensitive regex

//                 // Find student IDs matching the search term first
//                 const matchingStudents = await Student.find({
//                     $or: [
//                         { first_name: regex },
//                         { last_name: regex },
//                         { mail_id: regex },
//                          { phone: regex } // Added phone search based on your other file
//                         // Add other student fields to search if needed
//                     ]
//                 }).select('_id').lean(); // Use lean and only get the IDs

//                 const studentIds = matchingStudents.map(student => student._id);
//                 console.log(`Found ${studentIds.length} matching student IDs for search.`);

//                 // Now build the filter for CallLog combining notes, status, and student matches
//                 filter = {
//                     $or: [
//                         { notes: regex }, // Search in notes
//                         { status: regex } // Search in status
//                     ]
//                 };
//                  // Only add the student_id condition if matching students were found
//                 if (studentIds.length > 0) {
//                     filter.$or.push({ student_id: { $in: studentIds } });
//                 }

//             } else {
//                 console.log('No search term provided, using empty filter.');
//             }
//              console.log('Final Mongoose Filter:', JSON.stringify(filter));


//             // --- Execute Database Queries ---
//             // 1. Count the total number of documents matching the filter for pagination
//             console.log(`Executing CallLog.countDocuments()...`);
//             const total = await CallLog.countDocuments(filter);
//             console.log(`DB Total Count Result: ${total} total logs matching the filter.`);

//             // 2. Find the call logs for the current page with the filter
//             let callLogs = [];
//             if (total > 0 && skip < total) { // Only query if there are results and skip is valid
//                  console.log(`Executing CallLog.find()...`);
//                  // *** IMPORTANT: Verify the sort field. Use 'createdAt' if using timestamps: true in Schema, otherwise use your specific date field ***
//                  const sortField = 'createdAt'; // CHANGE 'createdAt' to 'date' or 'timestamp' if needed based on your Schema
//                  console.log(`Sorting by: { ${sortField}: -1 }`);

//                  callLogs = await CallLog.find(filter)
//                     .populate({ // More detailed populate options
//                          path: 'student_id',
//                          select: 'first_name last_name mail_id phone', // Select specific fields needed by client
//                          model: Student // Explicitly specify model if needed
//                     })
//                     .sort({ [sortField]: -1 }) // Sort by date, newest first (USE THE CORRECT FIELD NAME)
//                     .skip(skip)
//                     .limit(limitNumber)
//                     .lean(); // Use .lean() for better performance

//                  console.log(`DB Query Result: Found ${callLogs.length} call logs for this page.`);
//                  // Optional: Log the first few IDs found for verification
//                  // if (callLogs.length > 0) {
//                  //     console.log(`First few log IDs found: ${callLogs.slice(0, 3).map(log => log._id).join(', ')}`);
//                  // }
//             } else if (total === 0) {
//                  console.log('No documents match the filter. Skipping find query.');
//             } else {
//                  console.log(`Skip value (${skip}) is >= total (${total}). Returning empty array for this page.`);
//             }

//             // --- Send Response ---
//             console.log('Sending success response (200).');
//             console.log('------------------------\n');
//             // Ensure IDs are strings if needed by the client, .lean() might already handle this for ObjectId -> string
//             const processedLogs = callLogs.map(log => ({
//                 ...log,
//                 _id: log._id.toString(), // Ensure _id is string
//                 student_id: log.student_id ? { ...log.student_id, _id: log.student_id._id.toString() } : null, // Ensure nested student _id is string
//                  // Pass dates as ISO strings, client can format
//                  date: log[sortField] ? new Date(log[sortField]).toISOString() : null, // Use the same sortField here
//                  follow_up_date: log.follow_up_date ? new Date(log.follow_up_date).toISOString() : null,
//             }));

//             res.status(200).json({
//                 callLogs: processedLogs, // Use the processed logs
//                 total,    // The total count matching the filter
//                 currentPage: pageNumber,
//                 totalPages: Math.ceil(total / limitNumber),
//             });

//         } catch (error) {
//             console.error('!!! Error during GET /api/call-logs:', error);
//             console.log('------------------------\n');
//             res.status(500).json({ error: 'Server error while fetching call logs', details: error.message });
//         }

//     // --- Handle POST Requests (Creating Call Logs) ---
//     } else if (req.method === 'POST') {
//         console.log('\n--- [API POST /api/call-logs] ---');
//         console.log('Request Body:', req.body);
//         const { student_id, status, notes, needs_follow_up, follow_up_date } = req.body;

//         // Basic Validation
//         if (!student_id) { // Removed !status check, assuming default 'Completed' is okay
//              console.error('Validation Error: Missing required field (student_id).');
//              console.log('------------------------\n');
//             return res.status(400).json({
//                 error: 'Missing required field',
//                 details: 'Student ID is required.',
//             });
//         }

//         // Validate student exists
//         try {
//             const studentExists = await Student.findById(student_id).lean();
//             if (!studentExists) {
//                 console.error(`Validation Error: Student with ID ${student_id} not found.`);
//                  console.log('------------------------\n');
//                 return res.status(404).json({ error: 'Student not found', details: `No student found with ID ${student_id}` });
//             }
//         } catch (error) {
//              console.error(`Error checking student existence (ID: ${student_id}):`, error);
//               console.log('------------------------\n');
//               // Check if it's a CastError (invalid ObjectId format)
//              if (error.name === 'CastError') {
//                  return res.status(400).json({ error: 'Invalid Student ID format' });
//              }
//              return res.status(500).json({ error: 'Server error checking student', details: error.message });
//         }


//          if (needs_follow_up && !follow_up_date) {
//             console.error('Validation Error: Follow-up date required when needs_follow_up is true.');
//             console.log('------------------------\n');
//             return res.status(400).json({
//                 error: 'Missing follow-up date',
//                 details: 'Follow-up date is required when "Needs Follow-up" is checked.',
//             });
//         }


//         try {
//             const newCallLogData = {
//                 student_id,
//                 status: status || 'Completed', // Default status if not provided
//                 notes: notes || '', // Default empty string for notes
//                 needs_follow_up: !!needs_follow_up, // Ensure boolean
//                 // Only include follow_up_date if needs_follow_up is true and date is provided
//                 ...(!!needs_follow_up && follow_up_date && { follow_up_date: new Date(follow_up_date) }), // Convert string to Date
//                  // 'createdAt'/'updatedAt' fields will be added automatically by Mongoose timestamps: true
//             };
//             console.log('Data for new CallLog:', newCallLogData);

//             const newCallLog = new CallLog(newCallLogData);
//             const savedCallLog = await newCallLog.save();

//             // Populate student details for the response object
//             const populatedLog = await CallLog.findById(savedCallLog._id)
//                 .populate({
//                      path: 'student_id',
//                      select: 'first_name last_name mail_id phone',
//                      model: Student
//                 })
//                 .lean();

//              // Process the populated log for the response
//              const responseLog = {
//                 ...populatedLog,
//                 _id: populatedLog._id.toString(),
//                 student_id: populatedLog.student_id ? { ...populatedLog.student_id, _id: populatedLog.student_id._id.toString() } : null,
//                 date: populatedLog.createdAt ? new Date(populatedLog.createdAt).toISOString() : null, // Use createdAt or your date field
//                 follow_up_date: populatedLog.follow_up_date ? new Date(populatedLog.follow_up_date).toISOString() : null,
//             };


//             console.log('Call log saved and populated successfully. ID:', savedCallLog._id);
//             console.log('------------------------\n');

//             res.status(201).json({
//                 message: 'Call log created successfully',
//                 callLog: responseLog, // Send back the processed, populated log
//             });
//         } catch (error) {
//             console.error('!!! Error saving call log:', error);
//              // Handle potential validation errors from Mongoose
//             if (error.name === 'ValidationError') {
//                  const messages = Object.values(error.errors).map(e => e.message);
//                  console.log('------------------------\n');
//                  return res.status(400).json({ error: 'Validation Error', details: messages.join('; ') });
//             }
//              console.log('------------------------\n');
//             res.status(500).json({
//                 error: 'Server error while saving call log',
//                 details: error.message,
//             });
//         }

//     // --- Handle DELETE Requests (Deleting Call Logs) ---
//     } else if (req.method === 'DELETE') {
//         console.log('\n--- [API DELETE /api/call-logs] ---');
//         const { id } = req.query; // Get ID from query parameter
//         console.log('Attempting to delete log with ID:', id);

//         if (!id) {
//             console.error('Validation Error: Missing call log ID in query.');
//             console.log('------------------------\n');
//             return res.status(400).json({ error: 'Missing call log ID in request query' });
//         }

//          // Validate ID format
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//              console.error('Validation Error: Invalid Call Log ID format:', id);
//               console.log('------------------------\n');
//              return res.status(400).json({ error: 'Invalid Call Log ID format' });
//          }

//         try {
//             const deletedCallLog = await CallLog.findByIdAndDelete(id);

//             if (!deletedCallLog) {
//                 console.warn('Call log not found for deletion. ID:', id);
//                 console.log('------------------------\n');
//                 return res.status(404).json({ error: 'Call log not found with the provided ID' });
//             }

//             console.log('Call log deleted successfully. ID:', id);
//             console.log('------------------------\n');
//             res.status(200).json({ message: 'Call log deleted successfully', deletedId: id }); // Send back ID for confirmation

//         } catch (error) {
//             console.error(`!!! Error deleting call log with ID ${id}:`, error);
//             console.log('------------------------\n');
//             res.status(500).json({ error: 'Server error while deleting call log', details: error.message });
//         }

//     // --- Handle Other Methods ---
//     } else {
//         console.warn(`Method Not Allowed: ${req.method} requested for /api/call-logs`);
//         console.log('------------------------\n');
//         res.setHeader('Allow', ['GET', 'POST', 'DELETE']); // Inform client which methods are allowed
//         res.status(405).json({ error: `Method ${req.method} Not Allowed` });
//     }
// }


// File: pages/api/call-logs/index.js

import connectDb from '../../../config/db'; // Adjust path if necessary (e.g., '../../lib/db')
import CallLog from '../../../models/CallLog'; // Adjust path if necessary (e.g., '../../models/CallLog')
import Student from '../../../models/Student'; // Adjust path if necessary (e.g., '../../models/Student')
import mongoose from 'mongoose'; // Import mongoose if you need ObjectId validation

export default async function handler(req, res) {
    // Ensure DB connection
    try {
        await connectDb();
    } catch (error) {
        console.error('!!! Database Connection Error:', error);
        return res.status(503).json({ error: 'Database connection failed', details: error.message });
    }

    // --- Handle GET Requests (Fetching Call Logs) ---
    if (req.method === 'GET') {
        console.log('\n--- [API GET /api/call-logs] ---'); // Log start of request
        console.log('Request Query Parameters:', req.query); // Log raw query params

        const { page = 1, limit = 10, search = '' } = req.query;

        // Validate and parse pagination parameters
        const pageNumber = parseInt(page, 10);
        let limitNumber = parseInt(limit, 10); // Use let if you might cap it

        // Cap the limit to a reasonable maximum (e.g., 100)
        const MAX_LIMIT = 100;
        if (limitNumber > MAX_LIMIT) {
            console.warn(`Requested limit ${limitNumber} exceeds maximum ${MAX_LIMIT}. Capping limit.`);
            limitNumber = MAX_LIMIT;
        }

        console.log(`Parsed Params: page=${pageNumber}, limit=${limitNumber}, search='${search}'`);

        // Basic validation for pagination numbers
        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            console.error('Validation Error: Invalid page or limit parameters received.');
            console.log('------------------------\n');
            return res.status(400).json({ error: 'Invalid page or limit parameters. Page and limit must be positive integers.' });
        }

        // Calculate the number of documents to skip
        const skip = (pageNumber - 1) * limitNumber;
        console.log(`Calculated Skip: ${skip}`);

        try {
            // --- Build Search Filter ---
            let filter = {};
            const trimmedSearch = search.trim(); // Trim search term once

            if (trimmedSearch) {
                console.log(`Building search filter for term: "${trimmedSearch}"`);
                const regex = new RegExp(trimmedSearch, 'i'); // Case-insensitive regex

                // Find student IDs matching the search term first
                const matchingStudents = await Student.find({
                    $or: [
                        { first_name: regex },
                        { last_name: regex },
                        { mail_id: regex },
                        { phone: regex } // Added phone search based on your other file
                        // Add other student fields to search if needed
                    ]
                }).select('_id').lean(); // Use lean and only get the IDs

                const studentIds = matchingStudents.map(student => student._id);
                console.log(`Found ${studentIds.length} matching student IDs for search.`);

                // Now build the filter for CallLog combining notes, status, and student matches
                filter = {
                    $or: [
                        { notes: regex }, // Search in notes
                        { status: regex } // Search in status
                    ]
                };
                // Only add the student_id condition if matching students were found
                if (studentIds.length > 0) {
                    filter.$or.push({ student_id: { $in: studentIds } });
                }

            } else {
                console.log('No search term provided, using empty filter.');
            }
            console.log('Final Mongoose Filter:', JSON.stringify(filter));

            // Declare sortField here so it's available for both querying and processing
            const sortField = 'createdAt';

            // --- Execute Database Queries ---
            // 1. Count the total number of documents matching the filter for pagination
            console.log(`Executing CallLog.countDocuments()...`);
            const total = await CallLog.countDocuments(filter);
            console.log(`DB Total Count Result: ${total} total logs matching the filter.`);

            // 2. Find the call logs for the current page with the filter
            let callLogs = [];
            if (total > 0 && skip < total) { // Only query if there are results and skip is valid
                console.log(`Executing CallLog.find()...`);
                // *** IMPORTANT: Verify the sort field. Use 'createdAt' if using timestamps: true in Schema, otherwise use your specific date field ***
                console.log(`Sorting by: { ${sortField}: -1 }`);

                callLogs = await CallLog.find(filter)
                    .populate({
                        path: 'student_id',
                        select: 'first_name last_name mail_id phone', // Select specific fields needed by client
                        model: Student // Explicitly specify model if needed
                    })
                    .sort({ [sortField]: -1 }) // Sort by date, newest first (USE THE CORRECT FIELD NAME)
                    .skip(skip)
                    .limit(limitNumber)
                    .lean(); // Use .lean() for better performance

                console.log(`DB Query Result: Found ${callLogs.length} call logs for this page.`);
            } else if (total === 0) {
                console.log('No documents match the filter. Skipping find query.');
            } else {
                console.log(`Skip value (${skip}) is >= total (${total}). Returning empty array for this page.`);
            }

            // --- Send Response ---
            console.log('Sending success response (200).');
            console.log('------------------------\n');
            // Ensure IDs are strings if needed by the client; .lean() might already handle this for ObjectId -> string
            const processedLogs = callLogs.map(log => ({
                ...log,
                _id: log._id.toString(), // Ensure _id is string
                student_id: log.student_id ? { ...log.student_id, _id: log.student_id._id.toString() } : null, // Ensure nested student _id is string
                // Pass dates as ISO strings; client can format as needed
                date: log[sortField] ? new Date(log[sortField]).toISOString() : null, // Use the same sortField here
                follow_up_date: log.follow_up_date ? new Date(log.follow_up_date).toISOString() : null,
            }));

            res.status(200).json({
                callLogs: processedLogs, // Use the processed logs
                total,    // The total count matching the filter
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
            });

        } catch (error) {
            console.error('!!! Error during GET /api/call-logs:', error);
            console.log('------------------------\n');
            res.status(500).json({ error: 'Server error while fetching call logs', details: error.message });
        }

    // --- Handle POST Requests (Creating Call Logs) ---
    } else if (req.method === 'POST') {
        console.log('\n--- [API POST /api/call-logs] ---');
        console.log('Request Body:', req.body);
        const { student_id, status, notes, needs_follow_up, follow_up_date } = req.body;

        // Basic Validation
        if (!student_id) { // Removed !status check, assuming default 'Completed' is okay
            console.error('Validation Error: Missing required field (student_id).');
            console.log('------------------------\n');
            return res.status(400).json({
                error: 'Missing required field',
                details: 'Student ID is required.',
            });
        }

        // Validate student exists
        try {
            const studentExists = await Student.findById(student_id).lean();
            if (!studentExists) {
                console.error(`Validation Error: Student with ID ${student_id} not found.`);
                console.log('------------------------\n');
                return res.status(404).json({ error: 'Student not found', details: `No student found with ID ${student_id}` });
            }
        } catch (error) {
            console.error(`Error checking student existence (ID: ${student_id}):`, error);
            console.log('------------------------\n');
            // Check if it's a CastError (invalid ObjectId format)
            if (error.name === 'CastError') {
                return res.status(400).json({ error: 'Invalid Student ID format' });
            }
            return res.status(500).json({ error: 'Server error checking student', details: error.message });
        }

        if (needs_follow_up && !follow_up_date) {
            console.error('Validation Error: Follow-up date required when needs_follow_up is true.');
            console.log('------------------------\n');
            return res.status(400).json({
                error: 'Missing follow-up date',
                details: 'Follow-up date is required when "Needs Follow-up" is checked.',
            });
        }

        try {
            const newCallLogData = {
                student_id,
                status: status || 'Completed', // Default status if not provided
                notes: notes || '', // Default empty string for notes
                needs_follow_up: !!needs_follow_up, // Ensure boolean
                // Only include follow_up_date if needs_follow_up is true and date is provided
                ...(!!needs_follow_up && follow_up_date && { follow_up_date: new Date(follow_up_date) }), // Convert string to Date
                // 'createdAt'/'updatedAt' fields will be added automatically by Mongoose timestamps: true
            };
            console.log('Data for new CallLog:', newCallLogData);

            const newCallLog = new CallLog(newCallLogData);
            const savedCallLog = await newCallLog.save();

            // Populate student details for the response object
            const populatedLog = await CallLog.findById(savedCallLog._id)
                .populate({
                    path: 'student_id',
                    select: 'first_name last_name mail_id phone',
                    model: Student
                })
                .lean();

            // Process the populated log for the response
            const responseLog = {
                ...populatedLog,
                _id: populatedLog._id.toString(),
                student_id: populatedLog.student_id ? { ...populatedLog.student_id, _id: populatedLog.student_id._id.toString() } : null,
                date: populatedLog.createdAt ? new Date(populatedLog.createdAt).toISOString() : null, // Use createdAt or your date field
                follow_up_date: populatedLog.follow_up_date ? new Date(populatedLog.follow_up_date).toISOString() : null,
            };

            console.log('Call log saved and populated successfully. ID:', savedCallLog._id);
            console.log('------------------------\n');

            res.status(201).json({
                message: 'Call log created successfully',
                callLog: responseLog, // Send back the processed, populated log
            });
        } catch (error) {
            console.error('!!! Error saving call log:', error);
            // Handle potential validation errors from Mongoose
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                console.log('------------------------\n');
                return res.status(400).json({ error: 'Validation Error', details: messages.join('; ') });
            }
            console.log('------------------------\n');
            res.status(500).json({
                error: 'Server error while saving call log',
                details: error.message,
            });
        }

    // --- Handle DELETE Requests (Deleting Call Logs) ---
    } else if (req.method === 'DELETE') {
        console.log('\n--- [API DELETE /api/call-logs] ---');
        const { id } = req.query; // Get ID from query parameter
        console.log('Attempting to delete log with ID:', id);

        if (!id) {
            console.error('Validation Error: Missing call log ID in query.');
            console.log('------------------------\n');
            return res.status(400).json({ error: 'Missing call log ID in request query' });
        }

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('Validation Error: Invalid Call Log ID format:', id);
            console.log('------------------------\n');
            return res.status(400).json({ error: 'Invalid Call Log ID format' });
        }

        try {
            const deletedCallLog = await CallLog.findByIdAndDelete(id);

            if (!deletedCallLog) {
                console.warn('Call log not found for deletion. ID:', id);
                console.log('------------------------\n');
                return res.status(404).json({ error: 'Call log not found with the provided ID' });
            }

            console.log('Call log deleted successfully. ID:', id);
            console.log('------------------------\n');
            res.status(200).json({ message: 'Call log deleted successfully', deletedId: id }); // Send back ID for confirmation

        } catch (error) {
            console.error(`!!! Error deleting call log with ID ${id}:`, error);
            console.log('------------------------\n');
            res.status(500).json({ error: 'Server error while deleting call log', details: error.message });
        }

    // --- Handle Other Methods ---
    } else {
        console.warn(`Method Not Allowed: ${req.method} requested for /api/call-logs`);
        console.log('------------------------\n');
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']); // Inform client which methods are allowed
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
