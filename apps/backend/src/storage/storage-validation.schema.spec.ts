import { describe, expect, test } from "vitest";
import { STORAGE_VALIDATION_SCHEMA } from "./storage-validation.schema.js";

describe("STORAGE_VALIDATION_SCHEMA", () => {
    test("validates successfully with default local driver", () => {
        const result = STORAGE_VALIDATION_SCHEMA.validate(
            { FOLDER: "/tmp/eudiplo" },
            { allowUnknown: true },
        );
        expect(result.error).toBeUndefined();
        expect(result.value.STORAGE_DRIVER).toBe("local");
        expect(result.value.LOCAL_STORAGE_DIR).toBe("/tmp/eudiplo/uploads");
    });

    test("validates successfully for s3 driver without static credentials (IAM/IRSA role)", () => {
        const result = STORAGE_VALIDATION_SCHEMA.validate(
            {
                STORAGE_DRIVER: "s3",
                S3_REGION: "eu-central-1",
                S3_BUCKET: "my-eudiplo-bucket",
            },
            { allowUnknown: true },
        );
        expect(result.error).toBeUndefined();
        expect(result.value.STORAGE_DRIVER).toBe("s3");
        expect(result.value.S3_REGION).toBe("eu-central-1");
        expect(result.value.S3_BUCKET).toBe("my-eudiplo-bucket");
        expect(result.value.S3_ACCESS_KEY_ID).toBeUndefined();
        expect(result.value.S3_SECRET_ACCESS_KEY).toBeUndefined();
    });

    test("validates successfully for s3 driver with static credentials", () => {
        const result = STORAGE_VALIDATION_SCHEMA.validate(
            {
                STORAGE_DRIVER: "s3",
                S3_REGION: "us-east-1",
                S3_BUCKET: "my-bucket",
                S3_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
                S3_SECRET_ACCESS_KEY:
                    "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
                S3_ENDPOINT: "http://localhost:9000",
                S3_FORCE_PATH_STYLE: true,
            },
            { allowUnknown: true },
        );
        expect(result.error).toBeUndefined();
        expect(result.value.S3_ACCESS_KEY_ID).toBe("AKIAIOSFODNN7EXAMPLE");
        expect(result.value.S3_SECRET_ACCESS_KEY).toBe(
            "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        );
        expect(result.value.S3_FORCE_PATH_STYLE).toBe(true);
    });

    test("fails validation if s3 driver is missing S3_REGION", () => {
        const result = STORAGE_VALIDATION_SCHEMA.validate(
            {
                STORAGE_DRIVER: "s3",
                S3_BUCKET: "my-bucket",
            },
            { allowUnknown: true },
        );
        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain("S3_REGION");
    });

    test("fails validation if s3 driver is missing S3_BUCKET", () => {
        const result = STORAGE_VALIDATION_SCHEMA.validate(
            {
                STORAGE_DRIVER: "s3",
                S3_REGION: "us-east-1",
            },
            { allowUnknown: true },
        );
        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain("S3_BUCKET");
    });
});
