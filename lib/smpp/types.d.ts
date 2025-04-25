declare module 'smpp' {
  export class Session {
    constructor()
    connect(options: { host: string; port: number }): Promise<void>
    bind(options: {
      systemId: string
      password: string
      systemType?: string
      interfaceVersion?: number
    }): Promise<void>
    unbind(): Promise<void>
    close(): void
    submit(options: {
      sourceAddr: string
      sourceAddrTon: number
      sourceAddrNpi: number
      destAddr: string
      destAddrTon: number
      destAddrNpi: number
      shortMessage: string
      registeredDelivery: number
      dataCoding: number
    }): Promise<{ messageId: string }>
    on(event: string, callback: (error?: any) => void): void
  }
} 