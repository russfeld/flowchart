<?php

namespace App\Observers;

use App\Models\Meeting;

use DateTime;
use DateInterval;
use Mail;
use PHPMailer;

class MeetingObserver
{
    /**
     * Listen to the Meeting created event.
     *
     * @param  Meeting  $meeting
     * @return void
     */
    public function created(Meeting $meeting)
    {
      $type = "created";
      $this->sendMail($meeting, $type);
    }

    /**
     * Listen to the Meeting update event.
     *
     * @param  Meeting  $meeting
     * @return void
     */
    public function updated(Meeting $meeting)
    {
      $count = count($meeting->getDirty());
      if($meeting->isDirty("conflict")) $count = $count - 1;
      if($meeting->isDirty("updated_at")) $count = $count - 1;
      if($meeting->isDirty("status")) $count = $count - 1;
      if($meeting->isDirty("sequence")) $count = $count - 1;
      if($count > 0){
          $type = "updated";
          $this->sendMail($meeting, $type);
      }
    }

    /**
     * Listen to the Meeting deleting event.
     *
     * @param  Meeting  $meeting
     * @return void
     */
    public function deleting(Meeting $meeting)
    {
      $type = "removed";
      $this->sendMail($meeting, $type);
    }

    /**
     * Function to send meetin emails
     *
     * @param Meeting $meeting
     * @param String $type
     */
    private function sendMail($meeting, $type){
        if(config('app.send_email') == 'true'){
            $start = new DateTime($meeting->start);
            $end = new DateTime($meeting->end);

            $mail = new PHPMailer;

            //$mail->SMTPDebug = 3;                               // Enable verbose debug output

            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = config('mail.host');  // Specify main and backup SMTP servers
            if(config('mail.encryption') !== "off"){
                //$mail->SMTPDebug = 2;
                //$mail->Debugoutput = 'html';
                $mail->SMTPAuth = true;                               // Enable SMTP authentication
                $mail->Username = config('mail.username');                 // SMTP username
                $mail->Password = config('mail.password');                           // SMTP password
                $mail->SMTPSecure = config('mail.encryption');                            // Enable TLS encryption, `ssl` also accepted
            }else{
                //$mail->SMTPDebug = 2;
                //$mail->Debugoutput = 'html';
                $mail->SMTPAuth = false;
                $mail->SMTPAutoTLS = false;
            }
            $mail->Port = config('mail.port');                                    // TCP port to connect to

            $mail->From = $meeting->advisor->email;
            $mail->FromName = 'Engineering Advising';
            $mail->addAddress($meeting->student->email, $meeting->student->name);     // Add a recipient
            $mail->addAddress($meeting->advisor->email, $meeting->advisor->name);               // Name is optional

            //Convert MYSQL datetime and construct iCal start, end and issue dates
            $meetingstart = strtotime($meeting->start);
            $dtstart= gmdate("Ymd\THis\Z",$meetingstart);
            $meetingend = strtotime($meeting->end);
            $dtend= gmdate("Ymd\THis\Z",$meetingend);
            $todaystamp = gmdate("Ymd\THis\Z");

            //Create unique identifier
            $cal_uid = $meeting->id ."-123123123123123-@ksu.edu";

            //Create Mime Boundry
            $mime_boundary = "----Meeting Booking----".md5(time());

            //Create Email Headers
            $mail->ContentType = "multipart/alternative; boundary=".$mime_boundary;
            $mail->addCustomHeader("Content-class: urn:content-classes:calendarmessage");

            //Create Email Body (Text)
            $message = "--$mime_boundary\n";
            $message .= "Content-Type: text/plain; charset=UTF-8\n";
            $message .= "Content-Transfer-Encoding: 8bit\n\n";

            $message .= view('email.meetingtext')->with('meeting', $meeting)->with('type', $type);
            $message .= "\n";

            //Create Email Body (HTML)
            $message = "--$mime_boundary\n";
            $message .= "Content-Type: text/html; charset=UTF-8\n";
            $message .= "Content-Transfer-Encoding: 8bit\n\n";

            $message .= view('email.meeting')->with('meeting', $meeting)->with('type', $type);
            $message .= "\n";

            $message .= "--$mime_boundary\n";

            if($type != "removed"){
            //Create ICAL Content (Google rfc 2445 for details and examples of usage)
                $ical =    'BEGIN:VCALENDAR
PRODID:-//Microsoft Corporation//Outlook 11.0 MIMEDIR//EN
VERSION:2.0
METHOD:REQUEST
BEGIN:VEVENT
ORGANIZER;CN=Engineering Advising:MAILTO:'.$meeting->advisor->email.'
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN='.$meeting->advisor->email.':MAILTO:'.$meeting->advisor->email.'
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN='.$meeting->student->email.':MAILTO:'.$meeting->student->email.'
DTSTART:'.$dtstart.'
DTEND:'.$dtend.'
LOCATION:'.$meeting->advisor->office.'
TRANSP:OPAQUE
SEQUENCE:'.$meeting->sequence.'
UID:'.$cal_uid.'
DTSTAMP:'.$todaystamp.'
DESCRIPTION:'.$meeting->description.'
SUMMARY:'.$meeting->title.'
END:VEVENT
END:VCALENDAR';

                $message .= "Content-Type: text/calendar;name=\"meeting.ics\";method=REQUEST;charset=utf-8\n";
                $message .= "Content-Transfer-Encoding: 8bit\n\n";
                $message .= $ical;
            }else{
                //Create ICAL Content (Google rfc 2445 for details and examples of usage)
                $ical =    'BEGIN:VCALENDAR
PRODID:-//Microsoft Corporation//Outlook 11.0 MIMEDIR//EN
VERSION:2.0
METHOD:CANCEL
BEGIN:VEVENT
ORGANIZER;CN=Engineering Advising:MAILTO:'.$meeting->advisor->email.'
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN='.$meeting->advisor->email.':MAILTO:'.$meeting->advisor->email.'
DTSTART:'.$dtstart.'
DTEND:'.$dtend.'
LOCATION:'.$meeting->advisor->office.'
TRANSP:OPAQUE
SEQUENCE:'.$meeting->sequence.'
UID:'.$cal_uid.'
DTSTAMP:'.$todaystamp.'
DESCRIPTION:'.$meeting->description.'
SUMMARY:'.$meeting->title.'
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR';

                $message .= "Content-Type: text/calendar;name=\"meeting.ics\";method=CANCEL;charset=utf-8\n";
                $message .= "Content-Transfer-Encoding: 8bit\n\n";
                $message .= $ical;
            }



            $mail->Subject = "Advising - " . $meeting->title;
            $mail->Body = $message;

            if(!$mail->send()) {
                echo 'Message could not be sent. ';
            }
        }else{
            echo 'Email Disabled. ';
        }
    }
}
