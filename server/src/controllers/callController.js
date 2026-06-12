const http = require('http');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Contact, CallLog } = require('../models');

/**
 * POST /v1/calls/initiate
 * Originates a VoIP call via Asterisk AMI Originate API.
 */
const initiateCall = catchAsync(async (req, res) => {
    const { contactId, phoneNumber, sipExtension } = req.body;

    let targetNumber = '';
    let contactObj = null;

    if (contactId) {
        contactObj = await Contact.findByPk(contactId);
        if (!contactObj) {
            throw new ApiError(404, 'Contact not found');
        }
        targetNumber = contactObj.phone;
    } else if (phoneNumber) {
        targetNumber = phoneNumber;
    } else {
        throw new ApiError(400, 'contactId or phoneNumber is required');
    }

    // Clean number: remove any non-digit chars
    const cleanNumber = String(targetNumber).replace(/[^0-9]/g, '');
    if (!cleanNumber) {
        throw new ApiError(400, 'Invalid phone number format');
    }

    // Determine agent extension (defaulting to 1001)
    const callerId = sipExtension || req.user.sipExtension || '1001';

    // Load config parameters
    const amiIp = process.env.VOIP_AMI_IP || '84.247.182.13';
    const trunk = process.env.VOIP_AMI_TRUNK || '229224203';

    const amiUrl = `http://${amiIp}/webrtc_sip/api/ami.php?action=originate&channel=SIP/${trunk}/${cleanNumber}&exten=${cleanNumber}&context=default&callerid=${callerId}`;

    console.log(`[Call Initiate] Requesting Asterisk AMI: ${amiUrl}`);

    // Perform HTTP GET request to the dialer server
    http.get(amiUrl, (amiRes) => {
        let data = '';
        amiRes.on('data', (chunk) => {
            data += chunk;
        });
        amiRes.on('end', async () => {
            // Log the call attempt in CallLogs (starts as in_progress)
            const logEntry = await CallLog.create({
                contactId: contactObj ? contactObj.id : null,
                agentUserId: req.user.id,
                startedAt: new Date(),
                durationSeconds: 0,
                status: 'in_progress',
                outcome: 'Connected',
            });

            res.status(200).send({
                success: true,
                message: 'Call origination requested successfully',
                callId: logEntry.id,
                voipResponse: data.trim(),
            });
        });
    }).on('error', (err) => {
        console.error('[Call Initiate] Asterisk request error:', err);
        res.status(502).send({
            success: false,
            message: 'VoIP dialer server request failed',
            error: err.message,
        });
    });
});

module.exports = {
    initiateCall,
};
