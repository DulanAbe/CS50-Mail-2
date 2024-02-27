document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add other event handlers
  document.querySelector('#form-submit-button').addEventListener('click', send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Default inbox view

  // When we first load the view, reset it to baseline
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Fetch all of the users emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Make the inbox table
    const tbl = document.createElement("table");
    tbl.setAttribute("id", "inbox_table");
    tbl.className = "table table-hover";

    const tblBody = document.createElement("tbody");

    // Append table
    document.querySelector('#emails-view').append(tbl);
    document.querySelector('#inbox_table').append(tblBody);

    // Make the rows for the table
    for (let i = 0; i < emails.length; i++) {
      const row = document.createElement("tr"); 
      
      // Make the row for the table


      const read_cell = document.createElement("td");
      if (emails[i].read == false) {
        read_cell.innerHTML = '<i class="bi bi-circle-fill" style = "color: #D70040"></i>'
      }
      row.appendChild(read_cell);

      function addTextCol(className, text) {
        const sender_cell = document.createElement("td");  
        sender_cell.className = className;
        const sender_cell_text = document.createTextNode(text);
        sender_cell.appendChild(sender_cell_text);
        row.appendChild(sender_cell);
      }
      
      addTextCol("font-weight-bold", `${emails[i].sender}`);
      addTextCol("", `${emails[i].subject}`);
      addTextCol("text-muted text-right", `${emails[i].timestamp}`);

      row.setAttribute("data-email_id", emails[i].id)

      row.addEventListener("click", () => view_email(row.dataset.email_id))
      // for (let j = 0; j < 3; j++) {
      //   const cell = document.createElement("td"); 
      //   const cellText = document.createTextNode(`cell in row ${i}, column ${j}`);

      //   cell.appendChild(cellText);
      //   row.appendChild(cell);
      // }
      tblBody.appendChild(row);
    }


    
  }
    )

  

} 

function send_email() {
  console.log("Email sent")
  // Get all of the values from the form
  let send_recipients = document.querySelector('#compose-recipients').value;
  let send_subject = document.querySelector('#compose-subject').value;
  let send_body = document.querySelector('#compose-body').value;

  // Log them all to the console
  console.log(send_recipients);
  console.log(send_subject);
  console.log(send_body);

  // Send them to the server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: send_recipients,
      subject: send_subject,
      body: send_body  
    })
  })


}

function view_email(id) {


  // First empty the email-view: 
  document.querySelector('#email-view').innerHTML = ''

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Make a fetch call to the API
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {


    // Populate the email view;

    from = document.createElement('p');
    from.innerHTML = `<b>From:</b> ${email.sender}`;
    document.querySelector('#email-view').appendChild(from);

    to = document.createElement('p');
    recipients_string = email.recipients.toString();
    to.innerHTML = `<b>To:</b> ${recipients_string}`;
    document.querySelector('#email-view').appendChild(to);

    subject = document.createElement('p');
    subject.innerHTML = `<b>Subject:</b> ${email.subject}`;
    document.querySelector('#email-view').appendChild(subject);

    timestamp = document.createElement('p');
    timestamp.innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
    document.querySelector('#email-view').appendChild(timestamp);

    // Add a button to reply
    reply_button = document.createElement('button');
    reply_button.className = "btn btn-sm btn-primary m-1";
    reply_button.innerHTML = 'Reply';
    reply_button.setAttribute("id", "reply_button");
    
    reply_button.onclick = function () {
      reply_email(email.id);
    }

    document.querySelector('#email-view').appendChild(reply_button);




    // Add a button to archive
    archive_button = document.createElement('button');
    archive_button.className = "btn btn-sm btn-primary m-1";
    archive_button.setAttribute("id", "archive_button");
    
    // Check if email is archived or not: 
    if (email.archived) {
      archive_button.innerHTML = "Unarchive"; 
    } else {
      archive_button.innerHTML = "Archive"; 
    }



    archive_button.onclick = function () {
      archive_email(email.id, email.archived);
    }

    
    document.querySelector('#email-view').appendChild(archive_button);
    

    divider = document.createElement('hr');
    document.querySelector('#email-view').appendChild(divider);

    // Add the text 

    message = document.createElement('p');
    message.innerHTML = `${email.body}`; 
    document.querySelector('#email-view').appendChild(message);
    



  })

  // Mark the email as read: 
  fetch(`/emails/${id}`, {
    method: 'PUT', 
    body: JSON.stringify({
      read: true
    })
  })
}

function reply_email(email_id) {
  // Load the compose email view

  // Make a fetch request and get access to all the information 
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)

    compose_email();


    // Prefill the form
    document.querySelector('#compose-recipients').value = email.sender;
    
    
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
  })

}

 async function archive_email(email_id, archived) {

  console.log("Function running");
  console.log(archived)
  // Make a put request and to archive the email 
  if (archived) {
    console.log("This email is archived");
    // Unarchive the email
    await fetch(`/emails/${email_id}`, {
      method: 'PUT', 
      body: JSON.stringify({
        archived: false
      })
    })
    
    // Put a modal that the email has been archived
  } else {
    console.log("This email is not archived");
    // Archive the email 
    await fetch(`/emails/${email_id}`, {
      method: 'PUT', 
      body: JSON.stringify({
        archived: true
      })
    })
  }

  // Load email inbox: 
  load_mailbox('inbox');

}