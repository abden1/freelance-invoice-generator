import { PrismaClient, ContractType } from "@prisma/client";

const prisma = new PrismaClient();

const contractTemplates = [
  {
    type: ContractType.FREELANCE_AGREEMENT,
    title: "Freelance Service Agreement",
    content: `<h1>FREELANCE SERVICE AGREEMENT</h1>

<p>This Freelance Service Agreement ("Agreement") is entered into as of <strong>{date}</strong>, between:</p>

<p><strong>Service Provider:</strong> {freelancer_name}<br/>
<strong>Client:</strong> {client_name} ("Client")</p>

<h2>1. SERVICES</h2>
<p>Service Provider agrees to perform the following services for Client ("Services"):</p>
<p>{project_description}</p>

<h2>2. COMPENSATION</h2>
<p>Client agrees to pay Service Provider <strong>{currency} {amount}</strong> for the Services.</p>
<p>Payment terms: {payment_terms}</p>

<h2>3. PROJECT TIMELINE</h2>
<p>Services shall commence on {start_date} and be completed by {end_date}.</p>

<h2>4. INDEPENDENT CONTRACTOR</h2>
<p>Service Provider is an independent contractor and not an employee of Client. Service Provider is responsible for all taxes and insurance related to the Services.</p>

<h2>5. INTELLECTUAL PROPERTY</h2>
<p>Upon full payment, all work product created under this Agreement shall be the exclusive property of Client. Service Provider retains the right to display the work in their portfolio.</p>

<h2>6. CONFIDENTIALITY</h2>
<p>Service Provider agrees to keep confidential all information shared by Client and not to disclose it to any third party without prior written consent.</p>

<h2>7. REVISIONS</h2>
<p>This Agreement includes up to {revision_rounds} rounds of revisions. Additional revisions will be billed at the hourly rate of {hourly_rate}.</p>

<h2>8. TERMINATION</h2>
<p>Either party may terminate this Agreement with 14 days written notice. Client shall pay for all work completed up to the date of termination.</p>

<h2>9. LIMITATION OF LIABILITY</h2>
<p>Service Provider's total liability shall not exceed the total fees paid under this Agreement.</p>

<h2>10. GOVERNING LAW</h2>
<p>This Agreement shall be governed by the laws of {jurisdiction}.</p>

<p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>

<p><strong>Service Provider:</strong> {freelancer_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>

<p><strong>Client:</strong> {client_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>`,
  },
  {
    type: ContractType.NDA,
    title: "Non-Disclosure Agreement",
    content: `<h1>NON-DISCLOSURE AGREEMENT</h1>

<p>This Non-Disclosure Agreement ("Agreement") is entered into as of <strong>{date}</strong>, between:</p>

<p><strong>Disclosing Party:</strong> {client_name}<br/>
<strong>Receiving Party:</strong> {freelancer_name}</p>

<h2>1. DEFINITION OF CONFIDENTIAL INFORMATION</h2>
<p>For purposes of this Agreement, "Confidential Information" means any data or information that is proprietary to the Disclosing Party and not generally known to the public, including but not limited to:</p>
<ul>
<li>Business strategies, plans, and financial information</li>
<li>Technical specifications and source code</li>
<li>Customer lists and contact information</li>
<li>Trade secrets and proprietary processes</li>
<li>Any information related to {project_name}</li>
</ul>

<h2>2. OBLIGATIONS</h2>
<p>The Receiving Party agrees to:</p>
<ul>
<li>Keep all Confidential Information strictly confidential</li>
<li>Not disclose any Confidential Information to third parties</li>
<li>Use the Confidential Information solely for the purpose of {purpose}</li>
<li>Protect the Confidential Information with reasonable security measures</li>
</ul>

<h2>3. TERM</h2>
<p>This Agreement shall remain in effect for a period of {duration} from the date of execution.</p>

<h2>4. EXCLUSIONS</h2>
<p>This Agreement does not apply to information that: (a) is or becomes publicly available; (b) was known to the Receiving Party prior to disclosure; (c) is received from a third party without restriction; or (d) is required to be disclosed by law.</p>

<h2>5. REMEDIES</h2>
<p>The parties acknowledge that any breach of this Agreement may cause irreparable harm and that monetary damages may be insufficient. Therefore, the Disclosing Party shall be entitled to seek injunctive relief in addition to other remedies.</p>

<h2>6. GOVERNING LAW</h2>
<p>This Agreement shall be governed by the laws of {jurisdiction}.</p>

<p><strong>Disclosing Party:</strong> {client_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>

<p><strong>Receiving Party:</strong> {freelancer_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>`,
  },
  {
    type: ContractType.SOW,
    title: "Statement of Work",
    content: `<h1>STATEMENT OF WORK</h1>

<p><strong>Project Name:</strong> {project_name}<br/>
<strong>Client:</strong> {client_name}<br/>
<strong>Service Provider:</strong> {freelancer_name}<br/>
<strong>Date:</strong> {date}</p>

<h2>1. PROJECT OVERVIEW</h2>
<p>{project_description}</p>

<h2>2. SCOPE OF WORK</h2>
<p>The following deliverables are included in this Statement of Work:</p>
<p>{deliverables}</p>

<h2>3. PROJECT TIMELINE</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
<tr><th>Milestone</th><th>Description</th><th>Due Date</th></tr>
<tr><td>Project Kickoff</td><td>Initial meeting and requirements gathering</td><td>{start_date}</td></tr>
<tr><td>First Deliverable</td><td>Initial draft/prototype</td><td>{milestone_1_date}</td></tr>
<tr><td>Client Review</td><td>Client feedback and revisions</td><td>{milestone_2_date}</td></tr>
<tr><td>Final Delivery</td><td>Completed and approved deliverables</td><td>{end_date}</td></tr>
</table>

<h2>4. BUDGET</h2>
<p><strong>Total Project Cost:</strong> {currency} {amount}</p>
<p><strong>Payment Schedule:</strong></p>
<ul>
<li>50% ({currency} {deposit_amount}) due upon signing</li>
<li>50% ({currency} {final_amount}) due upon project completion</li>
</ul>

<h2>5. ASSUMPTIONS AND DEPENDENCIES</h2>
<p>This SOW is based on the following assumptions:</p>
<ul>
<li>Client will provide timely feedback within 3 business days</li>
<li>Client will provide all necessary assets and content</li>
<li>Scope changes will be handled via a separate change order</li>
</ul>

<h2>6. OUT OF SCOPE</h2>
<p>The following are NOT included in this Statement of Work:</p>
<p>{out_of_scope}</p>

<h2>7. CHANGE MANAGEMENT</h2>
<p>Any changes to the scope of work must be documented in a written Change Order and signed by both parties before work begins.</p>

<p><strong>Approved by Client:</strong> {client_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>

<p><strong>Approved by Service Provider:</strong> {freelancer_name}<br/>
Signature: _______________________<br/>
Date: {date}</p>`,
  },
  {
    type: ContractType.PROJECT_PROPOSAL,
    title: "Project Proposal",
    content: `<h1>PROJECT PROPOSAL</h1>

<p><strong>Prepared for:</strong> {client_name}<br/>
<strong>Prepared by:</strong> {freelancer_name}<br/>
<strong>Date:</strong> {date}<br/>
<strong>Valid Until:</strong> {valid_until}</p>

<h2>EXECUTIVE SUMMARY</h2>
<p>{executive_summary}</p>

<h2>UNDERSTANDING YOUR NEEDS</h2>
<p>Based on our conversations, I understand that you need:</p>
<p>{client_needs}</p>

<h2>PROPOSED SOLUTION</h2>
<p><strong>Project:</strong> {project_name}</p>
<p>{proposed_solution}</p>

<h2>DELIVERABLES</h2>
<p>Upon completion, you will receive:</p>
<p>{deliverables}</p>

<h2>TIMELINE</h2>
<p><strong>Estimated Duration:</strong> {duration}</p>
<p><strong>Proposed Start Date:</strong> {start_date}</p>
<p><strong>Proposed End Date:</strong> {end_date}</p>

<h2>INVESTMENT</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
<tr><th>Item</th><th>Description</th><th>Cost</th></tr>
<tr><td>Design & Development</td><td>Core project work</td><td>{currency} {amount}</td></tr>
<tr><td>Revisions</td><td>Up to {revision_rounds} rounds included</td><td>Included</td></tr>
<tr><td><strong>Total</strong></td><td></td><td><strong>{currency} {amount}</strong></td></tr>
</table>

<h2>ABOUT ME</h2>
<p>{about_me}</p>

<h2>NEXT STEPS</h2>
<p>To proceed with this proposal:</p>
<ol>
<li>Review and sign this proposal</li>
<li>Pay the 50% deposit of {currency} {deposit_amount}</li>
<li>Schedule our project kickoff call</li>
</ol>

<p>I look forward to working with you on {project_name}!</p>

<p><strong>Accepted by:</strong> {client_name}<br/>
Signature: _______________________<br/>
Date: _______________________</p>`,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert contract templates
  for (const template of contractTemplates) {
    await prisma.contractTemplate.upsert({
      where: {
        id: `system-${template.type.toLowerCase()}`,
      },
      update: {
        title: template.title,
        content: template.content,
      },
      create: {
        id: `system-${template.type.toLowerCase()}`,
        type: template.type,
        title: template.title,
        content: template.content,
        isSystem: true,
      },
    });
    console.log(`✅ Seeded template: ${template.title}`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
