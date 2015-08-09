An advising appointment has been {{ $type }}!

Title: {{ $meeting->title }}
Start: {{ $meeting->start }}
End: {{ $meeting->end }}
Student: {{ $meeting->student->name }}
Description: {{ $meeting->description }}

{{ url('/') }} - Visit the advising system