<?php
/**
 * kontakt.php — Anfrageformular ki-pate.at
 * Sendet an hallo@ki-pate.at, Honeypot-Spamschutz, Header-Injection-sicher.
 */

header('X-Content-Type-Options: nosniff');

function clean_line(string $v): string {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /#kontakt', true, 302);
    exit;
}

// Honeypot: echtes Feld bleibt leer
if (!empty($_POST['website'] ?? '')) {
    header('Location: /danke.html', true, 302); // Bots freundlich abtropfen lassen
    exit;
}

$name      = clean_line(mb_substr($_POST['name'] ?? '', 0, 120));
$firma     = clean_line(mb_substr($_POST['firma'] ?? '', 0, 120));
$email     = clean_line(mb_substr($_POST['email'] ?? '', 0, 190));
$telefon   = clean_line(mb_substr($_POST['telefon'] ?? '', 0, 60));
$nachricht = trim(mb_substr($_POST['nachricht'] ?? '', 0, 5000));

if ($name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /?fehler=1#kontakt', true, 302);
    exit;
}

$to      = 'hallo@ki-pate.at';
$subject = '=?UTF-8?B?' . base64_encode('KI-Sprechstunde: Anfrage von ' . $name) . '?=';

$body  = "Neue Anfrage über ki-pate.at\n";
$body .= "============================\n\n";
$body .= "Name:    {$name}\n";
$body .= "Firma:   " . ($firma !== '' ? $firma : '—') . "\n";
$body .= "E-Mail:  {$email}\n";
$body .= "Telefon: " . ($telefon !== '' ? $telefon : '—') . "\n\n";
$body .= "Nachricht:\n{$nachricht}\n\n";
$body .= "----------------------------\n";
$body .= "Zeit: " . date('d.m.Y H:i:s') . "\n";
$body .= "IP:   " . ($_SERVER['REMOTE_ADDR'] ?? '?') . "\n";

$headers  = "From: KI-Pate Website <hallo@ki-pate.at>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$ok = mail($to, $subject, $body, $headers, '-f hallo@ki-pate.at');

header('Location: ' . ($ok ? '/danke.html' : '/?fehler=1#kontakt'), true, 302);
exit;
