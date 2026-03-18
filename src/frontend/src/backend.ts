/* eslint-disable */
// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface MachinePart {
    name: string;
    status: string;
}
export interface MachineRecord {
    id: string;
    machineType: string;
    machineNo: string;
    doneDate: string;
    dueDate: string;
    parts: MachinePart[];
}
export interface backendInterface {
    addMachine(id: string, machineType: string, machineNo: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void>;
    getAllMachines(): Promise<MachineRecord[]>;
    deleteMachine(id: string): Promise<void>;
    updateMachine(id: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void>;
}

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>, private processError?: (error: unknown) => never) {}

    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try { return await fn(); } catch (e) { this.processError(e); throw new Error("unreachable"); }
        }
        return fn();
    }

    async addMachine(id: string, machineType: string, machineNo: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void> {
        return this.call(() => this.actor.addMachine(id, machineType, machineNo, doneDate, dueDate, parts));
    }
    async getAllMachines(): Promise<MachineRecord[]> {
        return this.call(async () => {
            const result = await this.actor.getAllMachines();
            return result as MachineRecord[];
        });
    }
    async deleteMachine(id: string): Promise<void> {
        return this.call(() => this.actor.deleteMachine(id));
    }
    async updateMachine(id: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void> {
        return this.call(() => this.actor.updateMachine(id, doneDate, dueDate, parts));
    }
}

export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    });
    return new Backend(actor, options.processError);
}
