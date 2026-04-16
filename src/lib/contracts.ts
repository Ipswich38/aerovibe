export type ContractStatus = "draft" | "sent" | "signed" | "cancelled";

export interface Contract {
  id: string;
  contact_id: string | null;
  project_id: string | null;
  title: string;
  template_key: string | null;
  content: string;
  variables: Record<string, string>;
  status: ContractStatus;
  public_token: string | null;
  client_signature_name: string | null;
  signed_at: string | null;
  signed_ip: string | null;
  signed_user_agent: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CONTRACT_STATUSES: { key: ContractStatus; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "text-white/50" },
  { key: "sent", label: "Sent", color: "text-cyan-400" },
  { key: "signed", label: "Signed", color: "text-green-400" },
  { key: "cancelled", label: "Cancelled", color: "text-white/30" },
];

export function contractStatusMeta(key: string): { label: string; color: string } {
  return CONTRACT_STATUSES.find((s) => s.key === key) || { label: key, color: "text-white/50" };
}

export const CONTRACT_TEMPLATES: Record<string, { label: string; body: string }> = {
  general: {
    label: "General Drone Services",
    body: `DRONE VIDEOGRAPHY / PHOTOGRAPHY SERVICES AGREEMENT

This agreement is entered into between waevpoint ("Provider") and {{client_name}} ("Client") on {{contract_date}}.

1. SCOPE OF SERVICES
Provider shall deliver aerial drone videography and/or photography services as described below:
{{service_description}}

Shoot date: {{shoot_date}}
Location: {{location}}
Expected deliverables: {{deliverables}}

2. FEES AND PAYMENT
Total service fee: PHP {{total_amount}}
Deposit: {{deposit_amount}} (50% due on signing)
Balance: Due on delivery of final files.
Accepted payment methods: GCash, bank transfer.

3. DELIVERY
Final edited files will be delivered within {{delivery_days}} days after the shoot, via a secure download link valid for 30 days.

4. WEATHER AND FLIGHT CONDITIONS
Drone operations are weather-dependent. If conditions are unsafe (strong wind, rain, low visibility), the shoot will be rescheduled at no additional cost within a 30-day window. If rescheduling is not possible due to Client availability, 50% of the deposit will be refunded.

5. USAGE RIGHTS
Client receives full personal and commercial usage rights for the delivered content.
Provider retains the right to use footage and photos for portfolio, marketing, and social media purposes unless Client requests otherwise in writing.

6. CANCELLATION
Cancellation more than 7 days before the shoot: full deposit refund.
Cancellation within 7 days: deposit is non-refundable.

7. LIABILITY AND COMPLIANCE
Provider operates in accordance with Civil Aviation Authority of the Philippines (CAAP) regulations. Provider maintains appropriate drone liability coverage. Provider's total liability under this agreement is limited to the fees paid by Client.

8. FORCE MAJEURE
Neither party is liable for delays or failure due to events beyond reasonable control, including severe weather, government restrictions, or equipment failure on shoot day (in which case rescheduling applies).

9. GOVERNING LAW
This agreement is governed by the laws of the Republic of the Philippines.

By signing below, both parties agree to the terms above.

Provider: waevpoint
Client: {{client_name}}
`,
  },
  wedding: {
    label: "Wedding / Event Coverage",
    body: `WEDDING / EVENT AERIAL COVERAGE AGREEMENT

This agreement is entered into between waevpoint ("Provider") and {{client_name}} ("Client") on {{contract_date}}.

1. EVENT DETAILS
Event type: {{event_type}}
Event date: {{shoot_date}}
Venue / location: {{location}}
Coverage time: {{coverage_hours}}

2. DELIVERABLES
{{deliverables}}

3. FEES
Total fee: PHP {{total_amount}}
Deposit to confirm booking: 50% ({{deposit_amount}}) due on signing.
Balance: due on or before event day.

4. WEATHER CONTINGENCY
Outdoor drone coverage is weather-dependent. If weather prevents flight, ground-level coverage will continue where agreed, and a complimentary aerial reshoot may be offered if practical. No refunds for weather on event day.

5. ATTENDANCE
Provider will arrive at least 30 minutes before scheduled coverage. Client is responsible for ensuring venue permits drone operation.

6. DELIVERY
Final edited highlights video and photos delivered within {{delivery_days}} days of the event.

7. USAGE RIGHTS
Client receives personal-use rights. Commercial use requires separate written agreement. Provider retains portfolio and social media usage rights.

8. CANCELLATION
Cancellation more than 14 days before event: deposit refunded less 10% admin fee.
Cancellation within 14 days: deposit non-refundable.

9. COMPLIANCE
All flights conducted under CAAP regulations. Provider holds appropriate certifications and insurance.

By signing, both parties agree to the terms above.

Provider: waevpoint
Client: {{client_name}}
`,
  },
  real_estate: {
    label: "Real Estate / Property",
    body: `REAL ESTATE AERIAL MEDIA AGREEMENT

This agreement is entered into between waevpoint ("Provider") and {{client_name}} ("Client") on {{contract_date}}.

1. PROPERTY DETAILS
Property address: {{location}}
Shoot date: {{shoot_date}}

2. SERVICES
{{service_description}}

Deliverables: {{deliverables}}

3. FEES
Total: PHP {{total_amount}}
50% deposit on signing, balance on delivery.

4. DELIVERY TIMELINE
Edited media delivered within {{delivery_days}} business days of the shoot.

5. USAGE RIGHTS
Client receives full usage rights for listing, marketing, and promotional materials related to the subject property. Sub-licensing to third parties (e.g. portals) is permitted. Provider retains portfolio rights.

6. WEATHER
Rescheduling at no cost if weather prevents safe flight.

7. COMPLIANCE
Provider complies with CAAP regulations and obtains any necessary flight permissions.

By signing, both parties agree to the above terms.

Provider: waevpoint
Client: {{client_name}}
`,
  },
};

export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{([a-z_]+)\}\}/g, (_m, k: string) => vars[k] ?? `{{${k}}}`);
}
