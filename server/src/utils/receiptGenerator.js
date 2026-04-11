import logger from "./logger.js";

/**
 * Generate transaction receipt HTML.
 * This renders a professional trade settlement statement for browser display or PDF export.
 */
export const generateReceiptHTML = (transaction) => {
  const {
    _id,
    buyer,
    seller,
    listing,
    quantity,
    pricePerCredit,
    totalAmount,
    paymentStatus,
    purchaseDate,
  } = transaction;

  const formattedDate = new Date(purchaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const quantityValue = Number(quantity) || 0;
  const unitPriceValue = Number(pricePerCredit) || 0;
  const totalValue = Number(totalAmount) || quantityValue * unitPriceValue;
  const safeStatus = String(paymentStatus || "pending").toLowerCase();
  const statusLabel = String(paymentStatus || "Pending");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trade Settlement Statement - ${_id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      color-scheme: light;
      --ink: #0f172a;
      --muted: #64748b;
      --line: #d9e2ec;
      --panel: #f8fafc;
      --brand: #0f766e;
      --brand-strong: #0f172a;
      --success: #047857;
      --success-bg: #ecfdf5;
      --soft: #eef2f7;
    }

    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--soft);
      color: var(--ink);
      padding: 28px;
      line-height: 1.6;
    }

    .statement {
      max-width: 980px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    }

    .statement__header {
      background: linear-gradient(180deg, #0f172a 0%, #111c2f 100%);
      color: #fff;
      padding: 34px 40px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-grid {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .brand h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.02em;
      margin-bottom: 8px;
    }

    .brand p {
      max-width: 650px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .doc-meta {
      text-align: right;
      min-width: 220px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.92);
      line-height: 1.7;
    }

    .doc-meta strong {
      display: block;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
    }

    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.08);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .statement__body {
      padding: 34px 40px 40px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 26px;
    }

    .summary-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 18px;
    }

    .summary-card .label {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .summary-card .value {
      font-size: 18px;
      color: var(--brand-strong);
      font-weight: 700;
      word-break: break-word;
    }

    .section {
      margin-bottom: 26px;
    }

    .section h2 {
      font-size: 14px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink);
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .info-item {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px 18px;
    }

    .info-label {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 15px;
      color: var(--ink);
      font-weight: 600;
      word-break: break-word;
    }

    .table-wrap {
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 16px 18px;
      text-align: left;
      border-bottom: 1px solid #e6edf5;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      color: #334155;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 800;
    }

    td {
      font-size: 14px;
      color: #0f172a;
    }

    .total-row {
      background: var(--success-bg);
      font-weight: 700;
    }

    .total-row td {
      color: var(--success);
      font-size: 16px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 92px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }

    .impact {
      margin: 22px 0;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: linear-gradient(180deg, #f8fafc 0%, #eef6f8 100%);
      text-align: center;
    }

    .impact h3 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ink);
      margin-bottom: 12px;
    }

    .impact .value {
      font-size: 40px;
      font-weight: 800;
      color: var(--success);
      line-height: 1;
      margin-bottom: 6px;
    }

    .impact .caption {
      font-size: 13px;
      color: var(--muted);
      font-weight: 600;
    }

    .seal {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.06);
      color: #0f172a;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .statement__footer {
      padding: 24px 40px 30px;
      background: #f8fafc;
      border-top: 1px solid var(--line);
      text-align: center;
    }

    .statement__footer p {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
    }

    .statement__footer p strong {
      color: var(--ink);
    }

    @media (max-width: 768px) {
      body {
        padding: 16px;
      }

      .statement__header,
      .statement__body,
      .statement__footer {
        padding-left: 20px;
        padding-right: 20px;
      }

      .header-grid,
      .summary-grid,
      .info-grid {
        grid-template-columns: 1fr;
      }

      .doc-meta {
        text-align: left;
      }
    }

    @media print {
      body {
        background: #fff;
        padding: 0;
      }

      .statement {
        border-radius: 0;
        border: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="statement">
    <header class="statement__header">
      <div class="header-grid">
        <div class="brand">
          <h1>Carbonix</h1>
          <p>Official trade settlement statement for verified carbon credit transactions and compliance records.</p>
          <div class="pill-row">
            <span class="pill">Verified Settlement</span>
            <span class="pill">Audit Ready</span>
            <span class="pill">Compliance Record</span>
          </div>
        </div>
        <div class="doc-meta">
          <strong>Document Reference</strong>
          <div>${_id}</div>
          <div>${formattedDate}</div>
          <div>${statusLabel}</div>
        </div>
      </div>
    </header>

    <main class="statement__body">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Buyer</div>
          <div class="value">${buyer?.email || "N/A"}</div>
        </div>
        <div class="summary-card">
          <div class="label">Seller</div>
          <div class="value">${seller?.email || "N/A"}</div>
        </div>
        <div class="summary-card">
          <div class="label">Settlement Status</div>
          <div class="value">${statusLabel}</div>
        </div>
      </div>

      <section class="section">
        <h2>Transaction Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Transaction ID</div>
            <div class="info-value">${_id}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date & Time</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Payment Status</div>
            <div class="info-value">
              <span class="status-badge status-${safeStatus}">${statusLabel}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Trade Type</div>
            <div class="info-value">Carbon Credit Purchase</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Trade Summary</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Quantity</th>
                <th>Price per Credit</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${listing?.title || "Carbon Credits"}</td>
                <td>${quantityValue} credits</td>
                <td>₹${unitPriceValue.toLocaleString()}</td>
                <td>₹${(quantityValue * unitPriceValue).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total Amount</td>
                <td>₹${totalValue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="impact">
        <h3>Environmental Impact</h3>
        <div class="value">${quantityValue}</div>
        <div class="caption">Tons of CO₂ Offset</div>
        <p style="margin-top: 10px; color: #64748b; font-size: 13px;">
          This purchase contributes to carbon reduction efforts and supports verified sustainability projects.
        </p>
      </section>

      <section class="section">
        <h2>Project Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Project Type</div>
            <div class="info-value">${listing?.projectType || "General"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Location</div>
            <div class="info-value">${listing?.location || "N/A"}</div>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Description</div>
            <div class="info-value">${listing?.description || "N/A"}</div>
          </div>
        </div>
        <div class="seal">Official Carbonix Trade Document</div>
      </section>
    </main>

    <footer class="statement__footer">
      <p><strong>Thank you for contributing to a sustainable future.</strong></p>
      <p>For questions about this transaction, please contact support@example.com</p>
      <p>This document was generated by the Carbonix platform for trading and compliance purposes.</p>
    </footer>
  </div>
</body>
</html>
  `;
};

/**
 * Generate receipt data for API response.
 */
export const generateReceiptData = (transaction) => {
  try {
    const html = generateReceiptHTML(transaction);

    logger.info(`Receipt generated for transaction ${transaction._id}`);

    return {
      success: true,
      receiptHTML: html,
      transaction: {
        id: transaction._id,
        date: transaction.purchaseDate,
        amount: transaction.totalAmount,
        status: transaction.paymentStatus,
      },
    };
  } catch (error) {
    logger.error("Error generating receipt:", error);
    throw error;
  }
};
