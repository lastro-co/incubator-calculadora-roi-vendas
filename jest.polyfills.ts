import { ReadableStream, TransformStream } from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";
import "whatwg-fetch";

// Mock BroadcastChannel for MSW
const __bcRegistry: Map<string, Set<MockBroadcastChannel>> = new Map();

class MockBroadcastChannel extends EventTarget {
  name: string;
  onmessage?: (ev: MessageEvent) => void;
  constructor(name: string) {
    super();
    this.name = name;
    const set = __bcRegistry.get(name) ?? new Set<MockBroadcastChannel>();
    set.add(this);
    __bcRegistry.set(name, set);
  }
  postMessage(data: unknown) {
    const peers = __bcRegistry.get(this.name);
    if (!peers) {
      return;
    }
    const evt = new MessageEvent("message", { data });
    for (const ch of peers) {
      if (ch === this) {
        continue;
      }
      ch.dispatchEvent(evt);
      ch.onmessage?.(evt);
    }
  }
  close() {
    const peers = __bcRegistry.get(this.name);
    peers?.delete(this);
    if (peers && peers.size === 0) {
      __bcRegistry.delete(this.name);
    }
    this.dispatchEvent(new Event("close"));
  }
}

Object.assign(global, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  BroadcastChannel: MockBroadcastChannel,
  Request: globalThis.Request ?? class Request {},
  Response: globalThis.Response ?? class Response {},
  Headers: globalThis.Headers ?? class Headers {},
});
