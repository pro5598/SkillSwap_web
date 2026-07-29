import { expect, test } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("landing page offers account creation", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Create Free Account" }),
    ).toBeVisible();
  });
  test("landing page links to registration", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Create Free Account" }),
    ).toHaveAttribute("href", "/register");
  });
  test("login page renders credentials fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("name@domain.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••").first()).toBeVisible();
  });
  test("login validates an invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/email/i).last()).toBeVisible();
  });
  test("login links to password recovery", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/forgot-password");
  });
  test("registration page renders required fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Your Firstname")).toBeVisible();
    await expect(page.getByPlaceholder("example@gmail.com")).toBeVisible();
  });
  test("forgot-password form shows success after a request", async ({
    page,
  }) => {
    await page.route("**/api/v1/auth/forgot-password", (route) =>
      route.fulfill({ json: { success: true } }),
    );
    await page.goto("/forgot-password");
    await page.getByPlaceholder("name@domain.com").fill("member@example.com");
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(
      page.getByText(/password reset link has been sent/i),
    ).toBeVisible();
  });
  test("reset-password rejects a missing reset token", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(
      page.getByRole("heading", { name: "Invalid Link" }),
    ).toBeVisible();
  });
});

test.describe("Dashboard and navigation protection", () => {
  for (const [path, label] of [
    ["/dashboard", "dashboard"],
    ["/dashboard/discover", "discover"],
    ["/dashboard/requests", "requests"],
    ["/dashboard/swaps", "swaps"],
    ["/dashboard/sessions", "sessions"],
    ["/dashboard/messages", "messages"],
    ["/dashboard/profile", "profile"],
    ["/dashboard/subscription", "subscription"],
  ]) {
    test(`redirects unauthenticated visitors from ${label}`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});

test.describe("Skill browsing", () => {
  for (const category of [
    "Software Engineering",
    "Language & Culture",
    "UI/UX Design",
    "Business & Marketing",
    "Photography & Video",
    "Music Production",
    "Data Science",
    "Cooking & Culinary Arts",
  ]) {
    test(`shows the ${category} category`, async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText(category, { exact: true })).toBeVisible();
    });
  }
});

test.describe("Landing-page navigation and content", () => {
  test("navbar sign-in link opens the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign In" }).first()).toHaveAttribute("href", "/login");
  });

  test("navbar get-started link opens registration", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Get Started" })).toHaveAttribute("href", "/register");
  });

  test("call-to-action links to registration", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign Up For Free" })).toHaveAttribute("href", "/register");
  });

  test("explains the three-step matching process", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "How SkillSwap Works" })).toBeVisible();
    await expect(page.getByText("Create Your Profile")).toBeVisible();
    await expect(page.getByText("Get Matched")).toBeVisible();
    await expect(page.getByText("Exchange & Learn")).toBeVisible();
  });

  test("answers the main pricing question", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Is SkillSwap truly free?")).toBeVisible();
    await expect(page.getByText(/No tokens, no credit cards/i)).toBeVisible();
  });
});

test.describe("Registration and password reset validation", () => {
  test("registration displays required-field validation", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Register Now" }).click();
    await expect(page.getByText("First name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("registration rejects mismatched passwords", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Your Firstname").fill("Alex");
    await page.getByPlaceholder("Your Lastname").fill("Doe");
    await page.getByPlaceholder("abc").fill("alex_doe");
    await page.getByPlaceholder("example@gmail.com").fill("alex@gmail.com");
    await page.getByPlaceholder("1234567890").fill("1234567890");
    await page.getByPlaceholder("••••••••").nth(0).fill("password123");
    await page.getByPlaceholder("••••••••").nth(1).fill("different123");
    await page.getByRole("button", { name: "Register Now" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("reset-password requires at least six characters", async ({ page }) => {
    await page.goto("/reset-password?token=valid-token");
    await expect(page.getByPlaceholder("••••••••").nth(0)).toHaveAttribute("minlength", "6");
    await expect(page.getByPlaceholder("••••••••").nth(1)).toHaveAttribute("minlength", "6");
  });

  test("reset-password rejects mismatched passwords", async ({ page }) => {
    await page.goto("/reset-password?token=valid-token");
    await page.getByPlaceholder("••••••••").nth(0).fill("password123");
    await page.getByPlaceholder("••••••••").nth(1).fill("different123");
    await page.getByRole("button", { name: "Reset Password" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("forgot-password shows an API error", async ({ page }) => {
    await page.route("**/api/v1/auth/forgot-password", (route) =>
      route.fulfill({ status: 500, json: { message: "Mail service unavailable" } }),
    );
    await page.goto("/forgot-password");
    await page.getByPlaceholder("name@domain.com").fill("member@example.com");
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(page.getByText("Mail service unavailable")).toBeVisible();
  });
});

test.describe("Swap flow access control", () => {
  for (const [path, name] of [
    ["/dashboard/discover", "request discovery"],
    ["/dashboard/requests", "received requests"],
    ["/dashboard/swaps", "active swaps"],
    ["/dashboard/sessions", "swap sessions"],
    ["/dashboard/messages", "swap messages"],
    ["/admin/swap-requests", "admin requests"],
    ["/admin/sessions", "admin sessions"],
    ["/dashboard/recommendations", "recommendations"],
  ]) {
    test(`requires sign-in before opening ${name}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(
        [
          "/dashboard/discover",
          "/dashboard/swaps",
          "/dashboard/sessions",
        ].includes(path)
          ? new RegExp(`${path}$`)
          : path.startsWith("/admin")
            ? /\/$/
            : /\/login$/,
      );
    });
  }
});

test.describe("Profile and settings access control", () => {
  for (const [path, name] of [
    ["/dashboard/profile", "profile"],
    ["/dashboard/subscription", "subscription settings"],
    ["/admin", "admin dashboard"],
    ["/admin/users", "user management"],
    ["/admin/users/create", "user creation"],
    ["/admin/sessions", "session management"],
    ["/admin/skills", "skill management"],
    ["/admin/swap-requests", "admin swap requests"],
  ]) {
    test(`protects ${name}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(
        path.startsWith("/admin") ? /\/$/ : /\/login$/,
      );
    });
  }
});
