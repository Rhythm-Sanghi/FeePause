import { test, expect } from '@playwright/test';

test.describe('FeePause End-to-End Application Suite', () => {
  test('Urgent sample opens fictional demo ledger with no corresponding charge', async ({ page }) => {
    await page.goto('/');

    // 1. Initial page load check
    await expect(page.getByRole('heading', { name: /Fee\s*Pause/i })).toBeVisible();
    await expect(page.getByText('Ready for Inspection')).toBeVisible();

    // 2. Click "Sample 1: Urgent Overdue Notice"
    const sampleBtn = page.locator('#btn-sample-urgent-suspicious');
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // 3. Observations and text populated
    const textarea = page.locator('#message-textarea');
    await expect(textarea).toHaveValue(/URGENT NOTICE: NORTHWOOD STUDENT ACCOUNTS OFFICE/);
    await expect(page.getByText('Extracted Text Observations')).toBeVisible();
    await expect(
      page.locator('.observation-rows').getByText('Specific fee amount claimed: $385.00').first()
    ).toBeVisible();

    // 4. Evidence Inspector displays details of selected observation
    const inspector = page.locator('.evidence-inspector');
    await expect(inspector.getByText('Exact Message Excerpt:')).toBeVisible();
    await expect(inspector.locator('.inspector-excerpt-box')).toHaveText('$385.00');
    await expect(inspector.getByText('What Remains Unverified:')).toBeVisible();

    // 5. Open Synthetic Portal
    const openPortalBtn = page.locator('#btn-open-mock-portal');
    await expect(openPortalBtn).toBeVisible();
    await openPortalBtn.click();

    // 6. Verify modal is visible and labeled as fictional
    const modal = page.locator('.portal-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Fictional Demonstration Ledger')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Northwood Tech — Student Accounts Self-Service/i })).toBeVisible();

    // 7. Verify REQUIRED EXACT PHRASES for urgent sample
    await expect(page.locator('[data-testid="portal-finding-urgent"]')).toBeVisible();
    await expect(page.getByText('No matching charge in this demo ledger')).toBeVisible();
    await expect(page.getByText('Reminder Status: The incoming reminder itself remains unverified.')).toBeVisible();

    // Confirm that $385.00 charge does NOT exist in the ledger table
    await expect(page.locator('.ledger-table').getByText('$385.00')).not.toBeVisible();

    // Close Modal via Escape or close button
    await page.locator('.btn-close-modal').click();
    await expect(modal).not.toBeVisible();
  });

  test('Routine reminder sample opens fictional demo ledger with matching charge', async ({ page }) => {
    await page.goto('/');

    // 1. Click "Sample 2: Routine Fee Reminder"
    const sampleBtn = page.locator('#btn-sample-ordinary-reminder');
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // 2. Observations and text populated
    const textarea = page.locator('#message-textarea');
    await expect(textarea).toHaveValue(/Northwood Campus Library Services/);
    await expect(
      page.locator('.observation-rows').getByText('Specific fee amount claimed: $42.50').first()
    ).toBeVisible();

    // 3. Open Synthetic Portal
    const openPortalBtn = page.locator('#btn-open-mock-portal');
    await expect(openPortalBtn).toBeVisible();
    await openPortalBtn.click();

    // 4. Verify modal is visible and labeled as fictional
    const modal = page.locator('.portal-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Fictional Demonstration Ledger')).toBeVisible();

    // 5. Verify REQUIRED EXACT PHRASES for routine sample
    await expect(page.locator('[data-testid="portal-finding-routine"]')).toBeVisible();
    await expect(page.getByText('Matching charge in this demo ledger')).toBeVisible();
    await expect(page.getByText('Reminder Status: The incoming reminder itself remains unverified.')).toBeVisible();

    // Confirm that $42.50 charge IS recorded in the ledger table as pending
    await expect(page.locator('.ledger-table').getByText('$42.50')).toBeVisible();
    await expect(page.locator('.ledger-table').getByText('Campus Library Materials Assessment')).toBeVisible();

    // Close Modal
    await page.locator('.btn-close-modal').click();
    await expect(modal).not.toBeVisible();
  });

  test('Custom or edited text does not inherit simulated match result', async ({ page }) => {
    await page.goto('/');

    // 1. First load urgent sample
    await page.locator('#btn-sample-urgent-suspicious').click();

    // 2. Now edit the text area to simulate user modifications
    const textarea = page.locator('#message-textarea');
    await textarea.fill('Custom modified fee demand of $95.00 due immediately.');
    await page.locator('#btn-check-request').click();

    // 3. College verification route remains available
    const banner = page.locator('.verification-banner');
    await expect(banner).toBeVisible();
    await expect(banner.locator('.verification-route-name')).toHaveText(
      'Northwood Student Accounts Self-Service (Demo Ledger)'
    );

    // 4. Open Synthetic Portal
    await page.locator('#btn-open-mock-portal').click();

    // 5. Verify explicit "No demo result for this message" state
    const modal = page.locator('.portal-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('[data-testid="portal-finding-custom"]')).toBeVisible();
    await expect(page.getByText('No demo result for this message')).toBeVisible();

    // Regression check: Assert that edited text shows NEITHER match outcome
    await expect(page.getByText('Matching charge in this demo ledger')).not.toBeVisible();
    await expect(page.getByText('No matching charge in this demo ledger')).not.toBeVisible();

    await expect(page.getByText('Reminder Status: The incoming reminder itself remains unverified.')).toBeVisible();

    await page.locator('.btn-close-modal').click();
  });

  test('Comprehensive privacy audit: zero marker leaks across requests, URLs, storage, console, and inert links', async ({
    page
  }) => {
    /**
     * PRIVACY TEST COVERAGE SPECIFICATION:
     * 1. Unique synthetic marker is placed in the message textarea.
     * 2. All outgoing network requests (same-origin and external) are intercepted and inspected:
     *    - URL strings cannot contain the marker.
     *    - Request post data / bodies cannot contain the marker.
     *    - ZERO external requests are dispatched.
     * 3. Browser address bar URL cannot contain the marker (no query parameter or hash leak).
     * 4. Browser storage boundaries are verified:
     *    - localStorage contains 0 keys and 0 values with the marker.
     *    - sessionStorage contains 0 keys and 0 values with the marker.
     *    - document.cookie contains 0 entries with the marker.
     * 5. Console logging is monitored:
     *    - No console.log, console.warn, or console.error outputs contain the marker.
     * 6. Pasted links remain completely inert:
     *    - Rendered as plain text / monospace, NOT clickable anchor <a> tags.
     *    - No prefetch or navigation occurs.
     */
    const uniqueSyntheticSecret = 'SYNTHETIC-PRIVACY-MARKER-XYZ7729-AUDIT';
    const pastedPhishUrl = 'https://phish-gateway-synthetic.invalid/pay-now';
    const interceptedRequests: { url: string; postData: string | null }[] = [];
    const consoleMessages: string[] = [];

    // Capture console output
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Capture all network activity
    await page.route('**/*', (route) => {
      const request = route.request();
      interceptedRequests.push({
        url: request.url(),
        postData: request.postData()
      });
      route.continue();
    });

    await page.goto('/');

    // Input unique synthetic string with a suspicious payment link
    const textarea = page.locator('#message-textarea');
    await textarea.fill(
      `URGENT BURSAR AUDIT: Outstanding fee of $150.00 for record ${uniqueSyntheticSecret}. Settle at ${pastedPhishUrl} within 2 hours.`
    );
    await page.locator('#btn-check-request').click();

    // Verify observation extracted without error
    await expect(page.locator('.observation-rows').getByText('Specific fee amount claimed: $150.00')).toBeVisible();

    // 1. Verify Browser URL does not leak the marker
    expect(page.url()).not.toContain(uniqueSyntheticSecret);
    expect(page.url()).not.toContain(encodeURIComponent(uniqueSyntheticSecret));

    // 2. Verify Storage Boundaries (localStorage, sessionStorage, cookies)
    const storageCheck = await page.evaluate((secret) => {
      const localStr = JSON.stringify(window.localStorage);
      const sessionStr = JSON.stringify(window.sessionStorage);
      const cookies = document.cookie;
      return {
        markerInLocal: localStr.includes(secret),
        markerInSession: sessionStr.includes(secret),
        markerInCookies: cookies.includes(secret),
        localKeysCount: Object.keys(window.localStorage).length,
        sessionKeysCount: Object.keys(window.sessionStorage).length
      };
    }, uniqueSyntheticSecret);

    expect(storageCheck.markerInLocal).toBe(false);
    expect(storageCheck.markerInSession).toBe(false);
    expect(storageCheck.markerInCookies).toBe(false);
    expect(storageCheck.localKeysCount).toBe(0);
    expect(storageCheck.sessionKeysCount).toBe(0);

    // 3. Verify Console Output contains no leaked marker
    const markerInConsole = consoleMessages.some((msg) => msg.includes(uniqueSyntheticSecret));
    expect(markerInConsole).toBe(false);

    // 4. Verify Same-Origin & External Network Requests
    for (const req of interceptedRequests) {
      expect(req.url).not.toContain(uniqueSyntheticSecret);
      if (req.postData) {
        expect(req.postData).not.toContain(uniqueSyntheticSecret);
      }
    }

    // Confirm ZERO external requests were made
    const externalRequests = interceptedRequests.filter(
      (r) => !r.url.startsWith('http://localhost:4173') && !r.url.startsWith('data:')
    );
    expect(externalRequests.length).toBe(0);

    // 5. Verify Pasted URLs remain strictly inert (not navigable <a> tags)
    const inertLinkLocator = page.locator('.observation-rows').getByText(pastedPhishUrl).first();
    await expect(inertLinkLocator).toBeVisible();
    // Confirm there are no anchor elements linking to the phishing URL
    const anchorTags = await page.locator(`a[href*="${pastedPhishUrl}"]`).count();
    expect(anchorTags).toBe(0);
  });

  test('Editing and Rechecking a message updates observations dynamically', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#message-textarea');
    await textarea.fill('Library fee balance: $25.00 due by Friday.');
    await page.locator('#btn-check-request').click();

    await expect(page.locator('.observation-rows').getByText('Specific fee amount claimed: $25.00')).toBeVisible();
    await expect(page.locator('.observation-rows').getByText('Short deadline or artificial urgency')).toBeVisible();

    // Edit message: change amount to $90.00 and add OTP request
    await textarea.fill('Urgent: please pay $90.00 and submit payment OTP immediately.');
    await page.locator('#btn-check-request').click();

    await expect(page.locator('.observation-rows').getByText('Specific fee amount claimed: $90.00')).toBeVisible();
    await expect(page.locator('.observation-rows').getByText(/Request for OTP/i)).toBeVisible();
  });

  test('Unsupported college fallback provides safe manual protocol without guessing contacts', async ({
    page
  }) => {
    await page.goto('/');

    // Select unsupported college
    await page.locator('#college-select').selectOption('unsupported');

    // Verification banner updates to manual protocol
    const banner = page.locator('.verification-banner');
    await expect(banner).toHaveClass(/unsupported-banner/);
    await expect(banner.getByText('Verify Directly with Unsupported College')).toBeVisible();
    await expect(
      banner.getByText('FeePause does not have a pre-verified directory route for this college')
    ).toBeVisible();
    await expect(
      banner.getByText('Open the student portal bookmark you already use for course registration')
    ).toBeVisible();
  });

  test('Clearing input resets the workspace and inspector', async ({ page }) => {
    await page.goto('/');

    // Load sample
    await page.locator('#btn-sample-urgent-suspicious').click();
    await expect(page.locator('#message-textarea')).not.toHaveValue('');

    // Clear
    await page.locator('#btn-clear-request').click();
    await expect(page.locator('#message-textarea')).toHaveValue('');
    await expect(page.getByText('Ready for Inspection')).toBeVisible();
    await expect(page.locator('.inspector-empty')).toBeVisible();
  });

  test('Message-supplied destination cannot replace sourced destination', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#message-textarea');
    await textarea.fill(
      'Pay your $500.00 fee right now at https://malicious-bursar-fake.invalid/transfer or call 1-800-FAKE-FEE.'
    );
    await page.locator('#btn-check-request').click();

    // The verified route remains the official Northwood demo ledger, not the phishing link
    const banner = page.locator('.verification-banner');
    await expect(banner.locator('.verification-route-name')).toHaveText(
      'Northwood Student Accounts Self-Service (Demo Ledger)'
    );
    await expect(banner.getByText('https://mock-bursar.northwood.invalid/ledger-guide')).toBeVisible();

    // SafeSpace isolation tag confirms sender-provided links were prevented from supplying destination
    await expect(banner.getByText('SafeSpace Isolation')).toBeVisible();
    await expect(banner.getByText('malicious-bursar-fake.invalid')).toBeVisible();
  });

  test('Empty input and input with no recognizable details', async ({ page }) => {
    await page.goto('/');

    // 1. Empty input
    await page.locator('#btn-check-request').click();
    await expect(page.getByText('No Fee Patterns Identified in Text')).toBeVisible();
    // Independent verification remains available
    await expect(page.locator('.verification-banner')).toBeVisible();

    // 2. Input with no recognizable details
    const textarea = page.locator('#message-textarea');
    await textarea.fill('Hope you have a wonderful weekend! See you in class on Monday.');
    await page.locator('#btn-check-request').click();

    await expect(page.getByText('No Fee Patterns Identified in Text')).toBeVisible();
    await expect(page.getByText('wordings alone cannot prove legitimacy')).toBeVisible();
    await expect(page.locator('.verification-banner')).toBeVisible();
  });
});
