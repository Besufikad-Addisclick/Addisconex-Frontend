import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 

export async function POST(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("[AddNewMaterial] No access token found in cookies");
    return NextResponse.json({ message: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    // console.log("[AddNewMaterial] FormData entries:", [...formData.entries()]);

    // Extract and validate fields
    const user_id = formData.get("user_id")?.toString();
    const category = formData.get("category")?.toString();
    const machinery = formData.get("machinery")?.toString();
    const price = formData.get("price")?.toString();
    const image_file = formData.get("image_file");
    const type = formData.get("type")?.toString();
    const location = formData.get("location")?.toString();
    const year = formData.get("year")?.toString();
    const condition = formData.get("condition")?.toString();
    const rental_duration = formData.get("rental_duration")?.toString();
    const specification = formData.get("specification")?.toString();
    const status = formData.get("status")?.toString();

    if (!user_id || !category || !machinery || !price || !image_file) {
      console.error("[AddNewMaterial] Invalid payload:", { user_id, category, machinery, price, image_file });
      return NextResponse.json(
        { message: "Invalid payload: Missing required fields (user_id, category, machinery, price, image_file)" },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("user_id", user_id);
    backendFormData.append("category", category);
    backendFormData.append("machinery", machinery);
    backendFormData.append("price", price);
    backendFormData.append("image_file", image_file);
    if (type) backendFormData.append("type", type);
    if (location) backendFormData.append("location", location);
    if (year) backendFormData.append("year", year);
    if (condition) backendFormData.append("condition", condition);
    if (rental_duration) backendFormData.append("rental_duration", rental_duration);
    if (specification) backendFormData.append("specification", specification);
    if (status) backendFormData.append("status", status);

    const url = `${API_BASE_URL}/add-machineries/`;
    console.log(`[AddNewMaterial] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: backendFormData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[AddNewMaterial] Non-JSON response: ${text.slice(0, 200)}...`);
      return NextResponse.json(
        { message: `Invalid response from server: Expected JSON, got ${contentType}`, details: text.slice(0, 200) },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    console.log("[AddNewMaterial] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[AddNewMaterial] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to add machinery: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[AddNewMaterial] Add machinery succeeded");
    return NextResponse.json({ message: "New machinery added successfully" });
  } catch (error: any) {
    console.error("[AddNewMaterial] Add machinery failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to add machinery: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);
  const urlParams = new URL(request.url).pathname.split("/");
  const id = urlParams[urlParams.length - 1];

  if (!session?.accessToken) {
    console.error("[UpdateMaterial] No access token found in cookies");
    return NextResponse.json({ message: "Unauthorized: No access token provided" }, { status: 401 });
  }

  if (!id) {
    console.error("[UpdateMaterial] No machinery ID provided");
    return NextResponse.json({ message: "Invalid request: No machinery ID provided" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    console.log("[UpdateMaterial] FormData entries:", formData);

    const user_id = formData.get("user_id")?.toString();
    const category = formData.get("category")?.toString();
    const machinery = formData.get("machinery")?.toString();
    const price = formData.get("price")?.toString();
    const image_file = formData.get("image_file");
    const type = formData.get("type")?.toString();
    const location = formData.get("location")?.toString();
    const year = formData.get("year")?.toString();
    const condition = formData.get("condition")?.toString();

    if (!user_id || !machinery || !price) {
      console.error("[UpdateMaterial] Invalid payload:", { user_id, category, machinery, price });
      return NextResponse.json(
        { message: "Invalid payload: Missing required fields (user_id, machinery, price)" },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("user_id", user_id);
    if (category) backendFormData.append("category", category);
    backendFormData.append("machinery", machinery);
    backendFormData.append("price", price);
    if (image_file) backendFormData.append("image_file", image_file);
    if (type) backendFormData.append("type", type);
    if (location) backendFormData.append("location", location);
    if (year) backendFormData.append("year", year);
    if (condition) backendFormData.append("condition", condition);

    const url = `${API_BASE_URL}/add-machineries/${id}/`;
    console.log(`[UpdateMaterial] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: backendFormData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[UpdateMaterial] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
      return NextResponse.json(
        {
          message: `Invalid response from server: Expected JSON, got ${contentType}`,
          details: text.slice(0, 200),
        },
        { status: response.status || 500 }
      );
    }

    const responseData = await response.json();
    console.log("[UpdateMaterial] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[UpdateMaterial] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to update machinery: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[UpdateMaterial] Update machinery succeeded");
    return NextResponse.json({ message: "Machinery updated successfully" });
  } catch (error: any) {
    console.error("[UpdateMaterial] Update machinery failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to update machinery: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);
  const urlParams = new URL(request.url).pathname.split("/");
  const id = urlParams[urlParams.length - 1];

  if (!session?.accessToken) {
    console.error("[DeleteMaterial] No access token found in cookies");
    return NextResponse.json({ message: "Unauthorized: No access token provided" }, { status: 401 });
  }

  if (!id) {
    console.error("[DeleteMaterial] No machinery ID provided");
    return NextResponse.json({ message: "Invalid request: No machinery ID provided" }, { status: 400 });
  }

  try {
    const url = `${API_BASE_URL}/add-machineries/${id}/`;
    console.log(`[DeleteMaterial] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const contentType = response.headers.get("content-type");
      let errorData;
      if (contentType?.includes("application/json")) {
        errorData = await response.json();
        console.error("[DeleteMaterial] API error response:", errorData);
      } else {
        const text = await response.text();
        console.error(`[DeleteMaterial] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
        errorData = { message: `Invalid response: Expected JSON or 204, got ${contentType}`, details: text.slice(0, 200) };
      }
      return NextResponse.json(
        { message: errorData.error || `Failed to delete machinery: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[DeleteMaterial] Delete machinery succeeded");
    return NextResponse.json({ message: "Machinery deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("[DeleteMaterial] Delete machinery failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to delete machinery: ${error.message}` },
      { status: 500 }
    );
  }
}