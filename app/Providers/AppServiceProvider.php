<?php

namespace App\Providers;

use App\Models\Blackout;
use App\Models\Blackoutevent;
use App\Models\Meeting;

use DateTime;
use DateInterval;
use Mail;
use PHPMailer;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blackout::saved(function ($blackout) {
            if($blackout->repeat_type == 1){ //daily
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = $blackout->start;
                $end = $blackout->end;
                $stop = $blackout->repeat_until;
                $stop->hour(23)->minute(59)->second(59);
                while($start < $stop){
                    $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $start)->where('start', '<', $end)->get();
                    foreach($collisions as $meeting){
                        $meeting->conflict = true;
                        $meeting->save();
                    }
                    $blackoutevent = new Blackoutevent;
                    $blackoutevent->title = $blackout->title;
                    $blackoutevent->start = $start;
                    $blackoutevent->end = $end;
                    $blackoutevent->advisor_id = $blackout->advisor_id;
                    $blackoutevent->blackout_id = $blackout->id;
                    $blackoutevent->repeat = true;
                    $blackoutevent->save();
                    $start->addDays($blackout->repeat_every);
                    $end->addDays($blackout->repeat_every);
                }
            }else if ($blackout->repeat_type == 2){//weekly
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = $blackout->start;
                $end = $blackout->end;
                $stop = $blackout->repeat_until;
                $stop->hour(23)->minute(59)->second(59);
                $interval = new DateInterval("P" . ($blackout->repeat_every - 1) . "W");
                $day = new DateInterval("P1D");
                while($start < $stop){
                    $dow = $start->format('w');
                    if(strpos($blackout->repeat_detail, $dow) !== FALSE){
                        $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $start)->where('start', '<', $end)->get();
                        foreach($collisions as $meeting){
                            $meeting->conflict = true;
                            $meeting->save();
                        }
                        $blackoutevent = new Blackoutevent;
                        $blackoutevent->title = $blackout->title;
                        $blackoutevent->start = $start;
                        $blackoutevent->end = $end;
                        $blackoutevent->advisor_id = $blackout->advisor_id;
                        $blackoutevent->blackout_id = $blackout->id;
                        $blackoutevent->repeat = true;
                        $blackoutevent->save();
                    }
                    if($dow == 6){
                        $start->addWeeks($blackout->repeat_every - 1);
                        $end->addWeeks($blackout->repeat_every - 1);
                    }
                    $start->addDay();
                    $end->addDay();
                }
            }else if ($blackout->repeat_type == 0){//no repeat
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $blackout->start)->where('start', '<', $blackout->end)->get();
                foreach($collisions as $meeting){
                    $meeting->conflict = true;
                    $meeting->save();
                }
                $blackoutevent = new Blackoutevent;
                $blackoutevent->title = $blackout->title;
                $blackoutevent->start = $blackout->start;
                $blackoutevent->end = $blackout->end;
                $blackoutevent->advisor_id = $blackout->advisor_id;
                $blackoutevent->blackout_id = $blackout->id;
                $blackoutevent->repeat = false;
                $blackoutevent->save();
            }
        });

        Meeting::created(function ($meeting) {
            $type = "created";
            AppServiceProvider::sendMail($meeting, $type);
        });

        Meeting::updated(function ($meeting) {
            $count = count($meeting->getDirty());
            if($meeting->isDirty("conflict")) $count = $count - 1;
            if($meeting->isDirty("updated_at")) $count = $count - 1;
            if($meeting->isDirty("status")) $count = $count - 1;
            if($meeting->isDirty("sequence")) $count = $count - 1;
            if($count > 0){
                $type = "updated";
                AppServiceProvider::sendMail($meeting, $type);
            }
        });

        Meeting::deleting(function ($meeting) {
            $type = "removed";
            AppServiceProvider::sendMail($meeting, $type);
        });
    }

    public static function sendMail($meeting, $type){
        if(config('app.send_email') == 'true'){
            $start = new DateTime($meeting->start);
            $end = new DateTime($meeting->end);

            $mail = new PHPMailer;

            //$mail->SMTPDebug = 3;                               // Enable verbose debug output

            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = config('mail.host');  // Specify main and backup SMTP servers
            if(config('mail.encryption') !== "off"){
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

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
