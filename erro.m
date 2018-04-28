#!/usr/bin/octave -qf

pkg load image;

arg_list = argv ();

img_name = arg_list{1};

img = imread(img_name);

img = bwmorph(img, 'close');

qtd = bwconncomp(~img);

if(qtd.NumObjects > 250)
  printf("1\n");
else
  img(:, 1:38) = 1;
  img(:, 346:384) = 1;
  imwrite(img, img_name);
  printf("0\n");  
endif  