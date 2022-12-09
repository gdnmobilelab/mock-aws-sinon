/// <reference types="sinon" />

declare module 'mock-aws-sinon' {
    import { SinonStub } from 'sinon';
    import * as aws from 'aws-sdk/clients/all';

    type AWSMethod = keyof typeof aws;

    interface AWSStub {
        /**
         * Replaces obj.method with a stub function.
         * An exception is thrown if the property is not already a function.
         * The original function can be restored by calling object.method.restore(); (or stub.restore();).
         */
        <T extends AWSMethod, K extends keyof InstanceType<(typeof aws)[T]>>(obj: T, method: K): InstanceType<typeof aws[T]>[K] extends (...args: infer TArgs) => infer TReturnValue
            ? SinonStub<TArgs, void>
            : SinonStub;
    }

    const Stub: AWSStub;

    export = Stub;
}