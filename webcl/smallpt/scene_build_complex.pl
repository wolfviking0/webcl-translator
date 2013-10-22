#!/usr/bin/perl

$maxDepth = 4.0;

sub PrintSphere {
    my $depth = shift;
    my $posx = shift;
    my $posy = shift;
    my $posz = shift;
    my $rad = shift;

    my $k = $depth / $maxDepth;
    my $col1 = 0.75 * $k;
    my $col2 = 0.75 * (1.0 - $k);

    print "sphere $rad $posx $posy $posz 0 0 0 $col2 0 $col1 0\n";
}

sub HyperSphere {
    my $depth = shift;
    if ($depth <= $maxDepth) {
        my $posx = shift;
        my $posy = shift;
        my $posz = shift;
        my $rad = shift;
        my $direction = shift;

        PrintSphere($depth, $posx, $posy, $posz, $rad);

        my $newRad = $rad / 2.0;
        if ($direction != 0) {
            HyperSphere($depth + 1.0, $posx - $rad - $newRad, $posy, $posz, $newRad, 1);
        }
        if ($direction != 1) {
            HyperSphere($depth + 1.0, $posx + $rad + $newRad, $posy, $posz, $newRad, 0);
        }
        if ($direction != 2) {
            HyperSphere($depth + 1.0, $posx, $posy - $rad - $newRad, $posz, $newRad, 3);
        }
        if ($direction != 3) {
            HyperSphere($depth + 1.0, $posx, $posy + $rad + $newRad, $posz, $newRad, 2);
        }
        if ($direction != 4) {
            HyperSphere($depth + 1.0, $posx, $posy, $posz - $rad - $newRad, $newRad, 5);
        }
        if ($direction != 5) {
            HyperSphere($depth + 1.0, $posx, $posy, $posz + $rad + $newRad, $newRad, 4);
        }
    }
}

# Directions:
# 0 - from -x
# 1 - from +x
# 2 - from -y
# 3 - from +y
# 4 - from -z
# 5 - from +z

HyperSphere(0.0, 0.0, 0.0, 0.0, 15.0, 2);