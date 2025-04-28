const smppConfig = {
  host: '114.199.74.35',
  port: 2775,
  systemId: 'XQB0213MKT',
  password: 'fS5cgh26',
  systemType: '',
  interfaceVersion: 0x34,
  sourceAddr: '45578', // Your short code
  sourceAddrTon: 0x05, // Changed from 0 to 0x05 (ALPHANUMERIC)
  sourceAddrNpi: 0x00, // Changed from 0 to 0x00 (UNKNOWN)
  destAddrTon: 0x01, // Changed from 0 to 0x01 (INTERNATIONAL)
  destAddrNpi: 0x01, // Changed from 0 to 0x01 (ISDN)
  registeredDelivery: 1, // Changed from 0 to 1 to enable delivery receipts
  dataCoding: 0,
  maxMessageLength: 140, // Maximum message length
};

export { smppConfig }; 