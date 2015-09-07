---
title: "Introduction to the Genome Analysis Toolkit (GATK) I"
date: 2013-12-29 23:27:06
tags:
  gatk
  install
  java
---


The [Genome Analysis Toolkit ](http://www.broadinstitute.org/gatk/)(GATK) is a nice software package for the analysis of sequence data. With the development of the [Allen Brain Atlas ](http://brain-map.org)and the desire to do analysis that spans imaging and genetics, I've been waiting for the perfect storm (or this is a good thing, so let's say the perfect sunny day) to teach myself this software and associated methods. I am following documentation from the Broad Institute to write this. Let's jump right in!

 

### Installation of the Genome Analysis Toolkit

<span style="line-height: 1.5em;">You definitely want to do this on a linux machine. You could use a virtual machine from Windows, or the pathetic cygwin, but I highly recommend just sticking with linux. First, register on the GATK website and </span>[download the software](http://www.broadinstitute.org/gatk/download)<span style="line-height: 1.5em;">. There login system is a little buggy - my credentials kept getting rejected, but then when I opened a new tab, I was logged in. You can extract the software to some nice folder where you have packages. Next, check your version of java. As of the end of 2013, you need </span>[java 1.7](http://www.oracle.com/technetwork/java/javase/downloads/index.html)<span style="line-height: 1.5em;"> for the software to work:</span>

code

If you don't, then first download JDK version 1.7 from oracle, and follow the installation instructions detailed on the page. I chose to install under /usr/local/java, e.g.,

code

If you want to permanently add this version of java to your path (to overwrite your old version, then you can edit your .bash_profile (or in linux mint it is just called .profile in the home folder). You can either add the following to this file, or just type it in a console for a one-time session:

code

I didn't do either of the above, actually, I decided to make an alias (also in my .profile), so I could call this version by typing "java7" and the old version would remain as "java"

code

And then typing java7 or java will run the correct version.

### 

 

### Testing the Genome Analysis Toolkit installation

Installation just means that you unzipped it to a folder. Go to that folder, and run (using either your java7 alias or just java):

code

If you see help text, you are golden! If you see this as the first line of an error message:

code

you are still using the wrong version of java.

 

### Getting Started with GATK

The raw data files that we are working with are called ([FASTQ](http://en.wikipedia.org/wiki/FASTQ_format)) and they are the output of, for example, an Ilumina Genome Analyzer. You can [read about the format](http://en.wikipedia.org/wiki/FASTQ_format), but largely it's a text file that lists the nucleotides that are present in the many snippets of DNA cut apart by the machine (my advisor said the typical length is ~35-75 base pairs (bp)), and there are billions. Each snippet of the read has 4 lines: an identifier, the read itself, another identifier/description line, and a quality line. A simple goal of this software is to put these pieces back together, taking into account missing reads, the potential for error, and data quality.

### 

### Data Preprocessing

This is where we go from our raw FASTQ files to what are called BAM files, which is a file that has all the snippets put back together, ready for analysis. For my fastq file (sometimes abbreviated .fq) I went into the "resources" directory of GATK, and decided to use "sample_1.fastq." The initial step of mapping your fastq reads to a reference genome is not done with GATK. So let's go through the following steps:

The steps involved are:

1. Mapping and Marking Duplicates
2. Local Realignment Around Indels
3. Base Quality Score Recalibration (BQSR)
4. Data Compression with ReduceReads (optional)
5. Variant discovery: from reads (BAM files) to variants (VCF files)
6. Suggested preliminary analyses

Don't worry, I haven't a clue what most of these steps are, so we are going to learn together! I have chosen a numbered list instead of bullets because they must be done in this order!

### 

 

### Mapping to a Reference Genome with the Burrows Wheeler Aligner

The basis of many of these analyses is mapping our reads in our fastq file to what is called a "[reference genome](http://en.wikipedia.org/wiki/Reference_genome)." A reference genome is basically an approximated template sequence for a particular species or human subtype (eg, European vs African). If you imagine taking a population of individuals and lining up their sequences, the reference genome might get the most highly agreed upon letter in each position. Even if our fastq snippets don't have perfect overlap with this reference, the overlap is similar enough so that we can use the reference to correctly order our snippets. For this aim, we are going to be using the [Burrows-Wheeler Aligner](http://bio-bwa.sourceforge.net/), which is suggested by GATK.

#### Download and Install Stuff!

My first strategy was to find different examples of reference genomes and random reads off of the internet, and I quickly learned that this was a bad idea. A more experienced colleague of mine summed it up nicely: "Don't waste good analyses trash." Apparently, there is quite a bit of sketchy data out there. My next strategy was to look at the [Broad Institute resource bundle](http://gatkforums.broadinstitute.org/discussion/1213/what-s-in-the-resource-bundle-and-how-can-i-get-it).

You basically connect to their FTP server, and have lots of files to choose from. At the highest level is a zip called "tutorial_files.zip." This has a reference genome, fasta file, and a few .vcf file with known SNPs:

code

I don't know that much about genetic analyses, but think that the dbsnp*.vcf and indels*.vcf and Homo_sapiens*.vcf files are all known SNPs, and the .fasta file is our reference. I would also guess that the "20" refers to the chromosome that the reads are for. the dedupped_20.bam file is of reads that have already been processed (mapped to the reference and duplicates removed). Since we aren't given a file of raw reads (and this preprocessing is important) - I also downloaded the exampleFASTA.fasta.zip in the "exampleFASTA" folder. We can learn preprocessing using this file, and then switch over to the provided bam file, since we haven't a clue what the exampleFASTA is.

Now, let's [install BWA](http://bio-bwa.sourceforge.net/). Let's also grab the "samtools," which stand for "Sequence Alignment/Map" Tools, which is the file format that is used to store large sequences of nucleotides. What isn't totally obvious is that you also need to install "htslib" https://github.com/samtools/htslib as a part of samtools:

code

You can either put it where it expects it (as instructed above), or see line 52 of the MakeFile and change the path to where you installed it.  We also need the Picard tools to sort the reads by coordinate. [Download and unzip the software](http://picard.sourceforge.net/) to your directory of choice.

[![picard](http://www.vbmis.com/learn/wp-content/uploads/2013/12/picard.jpg)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/picard.jpg)

Now let's start using these tools! First, here is how you can add the directory to any set of tools to your path, so it's easy to call:

code

You can also add that to your .profile (or .bash_rc) if you want it to happen at startup.

#### 

#### Index your reference genome

Have you heard of a hash table in computer science? You can think of it like a dictionary in python or your language of choice - it's a data structure that maps keys to values, or makes it easy to compute an index into some array, and each index is unique. I imagine that we would need to do something like this for the reference genome, because it's such a beastly file. Which algorithm should we use? The default algorithm is called "IS":

code

what we would want for whole genome (the hg19.fa file) is BWT-SW:

code

This is local sequence alignment! We learned about this in Russ' BMI 214 class! From the documentation, the BWT-SW algorithm seeds alignments with maximal exact matches (MEMs) and then extends seeds with the affine-gap Smith-Waterman algorithm (SW). Note that if you use whole genome this step can take a couple of hours, and you need 5GB of memory:

code

This creates a truck ton of files (.amb,.bwt,.ann,.pac,.sa) that I'm thinking are for BWA to use to perform the alignment. LOOK UP THESE FILES. When the above finishes, we now want to make a simple file that lists the indexes. Remember the samtools?:

code

The output of this ends in "*.fai" which I think stands for "fasta index," and the script doesn't produce any interesting output in the terminal window. If we look at the file, each line has a contig ("a set of overlapping DNA segments that together represent a consensus region of DNA") name, size, location, basesPerLine, and bytesPerLine. Here is the fa index file for chromosome 20 (human_b37_20.fasta.fai):

[![fai_small](http://www.vbmis.com/learn/wp-content/uploads/2013/12/fai_small.png)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/fai_small.png)

My, that's a tiny file!  I also want to show the index for the whole genome (hg19.fa), just to demonstrate that we have many more chromosomes:

[![fai_file](http://www.vbmis.com/learn/wp-content/uploads/2013/12/fai_file-785x703.png)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/fai_file.png)

Now let's jump back to the Picard tools and create a sequence dictionary, "human_b37_20.fasta.dict" by running the following:

code

This produces some job output to the screen as well. I can imagine if I were setting this up in a massive processing pipeline, I would want to direct all this screen output to some job file, for checking in the case of error. Here is a snapshot of what the dictionary looks like:

code

@HD specifies the header line. VN is the version. SO means "sorting order."  
 @SQ specifies the start of the sequence dictionary. SN is the reference sequence name (20), and LN is the reference sequence length. UR is the URI of the sequence, which is a uniform resource identifier, which is like a unique ID that can be used for many kinds of web resources.  Here is the whole genome dictionary (just to compare):

[![hg19_dict](http://www.vbmis.com/learn/wp-content/uploads/2013/12/hg19_dict-300x185.png)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/hg19_dict.png)

#### 

 

#### (Finally) Mapping to a Reference Genome with the Burrows Wheeler Aligner

Now let's use BWA to create our SAM, or Sequence Alignment/Map file. I highly stress to read the README.md file, which tells us about the different algorithms that can be used to match data to a reference genome (BWA-backtrack, BWA-SM, and BWA-MEM). BWA-MEM is recommended as the latest for high quality queries. For this example, our reference is called "human_b37_20.fasta."

code

The "-R" argument is the "read group," for more information seem the SAM file spec: http://samtools.sourceforge.net/SAMv1.pdf. The only required fields seem to be the ID and SM (sample). If you had more than one reads file, each would need a unique ID. Thanks to my friend "Boots" for pointing this out to me ![:)](http://www.vbmis.com/learn/wp-includes/images/smilies/simple-smile.png)

If you don't specify the read string, then your SAM file won't have read group information, and you will need to add this later (I include this step in the walkthrough below.) I would recommend doing it correctly from the start, but if you don't, I go over the "fix it" step later.

<span style="line-height: 1.5em;"></span>

code

This is the first step that appears to produce a compiled file (e.g., I can no longer open something coherent in my text editor). As a reminder, we started with a bunch of unordered reads, and we first aligned them to a reference genome, and then we sorted them based on their coordinate. Are we done with preprocessing? Not quite yet! During sequencing, the same DNA molecule can be sequenced multiple times, meaning that we could have duplicates. This doesn't do much to help us, so let's get rid of these duplicates. This process is called "dedupping."

code

What in the world is in the metrics file? It looks like a job file that keeps a log of the duplicates. Finally, as a last step in pre-preprocessing, we need to create an index file for the BAM file:

code

We are now done with pre-preprocessing!

### 

 

### Local Realignment Around Indels

In neuroimaging analysis, dealing with noise is like brushing your teeth in the morning. The same seems to be true for sequence alignment. An indel is a term that we use to describe either an insertion or deletion. When we do this initial mapping, a read that aligns with the edge of an indel can look like single nucleotide polymorphisms (SNPs), but it's just noise. This realignment procedure aims to correct these mapping artifacts. This step is basically running Smith-Waterman over the entirety of an aggregated BAM file, however the documentation notes that if you have a super large number of BAM files, you can run the script in "-knownsOnly" mode, which will clean up sites known in dbSNP or 1000 genomes. You might also want to do this if you are worried about false positives (eg, tagging a SNP as noise when it's not!). Most of an individual's known indels will be found here, and of course any novel sites will not be cleaned. If your lab has a list of known indel sites (called "gold_indels.vcf") you can specify for GATK to use it (see below), or what I did is use the .vcf files provided in the tutorial zip. This is also where we want to use their dedupped_20.bam, otherwise you get an error message about having a file with a mismatched number of bases and qualities. Don't forget to first index the bam file:

code

And now

code

At this point, if you don't have the read group specified, the GATK will give you this error:

code

Oops. This is where not specifying the read group information when I first use bwa came back to bite me in the butt! If you do have this read information, skip the next two steps. If not, let's see if we can fix this... thank goodness picard has a nice little script to do just that:

code

I wasn't entirely sure where to get this kind of information for a random fq file that I downloaded. I'm guessing it would be in the documentation from wherever the data is sequenced. So, I just used the dummy information above. I then created a fixed BAM index file:

code

So now we have another bam index file, with the same name but appended with "bai." Now, you would try the RealignerTargerCreator command from above once more, but with the addrg_reads.bam file.

I'll admit to you that I've gone through this sequence of steps muliple times, and finally when I didn't get an error message on this step I wanted to dance! And guess what? It's tracking your every move too... sent to Amazon S3!

code

Our output is a list of intervals that are deemed to need realignment, spit out in a text file called "target_intervals.list."

[![target_intervals](http://www.vbmis.com/learn/wp-content/uploads/2013/12/target_intervals-300x202.png)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/target_intervals.png)

Now we should take this list... and do the realignments! Let's compare to the command above to better familiarize with GATK. The -T argument obviously is specifying the analysis type, R is always going to have our reference, I the input, and the rest are self explanatory:

code

The output of this step is "realigned_reads.bam," or a file similar to the original dedup_reads.bam, but cleaned up! Now we can move on to the next step.

### 

 

### Base Quality Score Recalibration (BSQR)

As we noted earlier, one of the lines (for each read) in these sequence files (both the raw and BAM/SAM files) is an indicator of the quality of the read. This is a super important metric, and unfortunately it is subject to error as well. We are going to use methods from machine learning to make it so that these quality scores are closer to representing the probability of an error in matching to our reference genome. For more details, see here: http://www.broadinstitute.org/gatk/guide/article?id=44. I recommend scrolling down to the plots to see the "before" and "after" shots of the quality score distribution. First we are going to figure out what patterns of covariation we have in our sequence dataset:

code

This is an initial model, and we then create a secondary model that looks for remaining covariation after recalibration:

code

The -BQSR points GATK to our previously-made file with the recalibration data. To make these analyses a little less "black box," let's look at the base quantities before and after recalibration:

code

This didn't work the first time I tried it - I got an error about the RScript. I figured out that I was missing some libraries in R, so here is how to install them. I had to download an older version of gplots from the archive: http://cran.r-project.org/src/contrib/Archive/gplots/

code

If installing those doesn't work for you, try running the script on your own to debug:  
 https://github.com/broadgsa/gatk-protected/blob/master/public/R/scripts/org/broadinstitute/sting/utils/recalibration/BQSR.R

If you run the AnalyzeCovariates with the flag "-l DEBUG" you can see where the output .csv file is put, which you would need for the R script. I'm glad that it finally worked for me and I didn't have to do that! My [plots generally looked like this](http://www.broadinstitute.org/gatk/guide/article?id=44), which looked ok, so I moved on to applying the recalibration to my bam file:

<span style="line-height: 1.5em;"></span>

code

This "recal_reads.bam" file now has quality scores that are more accurate. It looks like the old ones get written over, but if you are an anxious personality type and don't want to lose them, use the "-emit-original-quals" flag to keep them in the file with the tag "OQ." We are now done with recalibration, and can move on to variant discovery! Note that if you have large data, you might want to use the "[ReduceRead" tool](http://www.broadinstitute.org/gatk/guide/article?id=2802) to compress your data before moving forward:

### 

 

### Variant Discovery

What does variant discovery mean? It means finding sites in your reads (the bam file) where the genome is different from the reference, and suck out those sites to see what the difference is. This process contains two steps:

- variant calling (designed to maximize sensitivity, or the true positive rate),
- variant quality score recalibration (VQSR, filters to improve specificity, true negative rate).

Before we run this: a few notes. The default mode is called "DISCOVERY," and this means we choose the most probable alleles in the data. If you are only interested in a certain set of alleles, change that arg to "GENOTYPE_GIVEN_ALLELES" and then pass a .vcf file with the "-alleles" argument. I don't have a good sense for the confidence thresholds, so I'm going to use the default suggested in the documentation:

code

When I was running the above, I saw this message:

code

Despite the enormous runtime of the above command, I decided to run it again, using the max_alternate_alleles argument. That would give me two files to work with, raw_variants.vcf, and raw_variants_maxaa.vcf.

code

Both of these files have alleles (SNPs, insertions, and deleltions) from our sequence that are different from the reference genome. Let's take a look!  I always recommend using vim to look at these - it doesn't freak out with the big file size like gedit does:

[![rawvars](http://www.vbmis.com/learn/wp-content/uploads/2013/12/rawvars-300x149.png)](http://www.vbmis.com/learn/wp-content/uploads/2013/12/rawvars.png)

As a reminder, we just maximized sensitivity, meaning that we aren't going to miss real variants. However, in that nice little .vcf file, we probably have some false positives too, and need to do some filtering to reduce that number of false positives. For the below, I returned to the Broad Institute resource bundle, and downloaded (and unzipped) the following files into a "ref" folder:

code

I downloaded the index files as well, but you could also make them like we did earlier. This is one of those "I'm not entirely sure if I'm doing the right thing, but I think so," things, after reading the [documentation here](http://www.broadinstitute.org/gatk/guide/best-practices#realignment_faqs_1247).

code

Then apply the recalibration:

code

This didn't actually work for me, and those files are indeed the ones they suggest using. I think it's because my file is too small, so instead I'm going to apply hard filters, first to my SNPs, and then to the indels:

code

That made a file with SNPs from the original file of raw variants, and now we need to apply a manual filter. Here I am again going to use the suggested values:

 60.0 || mq < 40.0 || haplotypescore > 13.0 || mappingqualityranksum code

Now if we look at the filtered_snps.vcf file, we can see PASS labels for the ones that passed the filter, and if it didn't pass, it says "vanessa_snp_filter." Next, let's do the same for the indels (insertions and deletions) from the call set. You'll notice that we are again using the "SelectVariants" option, but instead of "SNP" for the select type, we are choosing "INDEL":

code

Now we have the file "raw_indels.vcf" that just has the insertions and deletions from the original file of raw variants. Let's again apply manual filters:

 200.0 || readposranksum code

We are done filtering! At this point it's time for preliminary analysis, and next comes analysis.  Since this post is quite a bit long, I'm going to end it here, and will do preliminary analysis in a second post.

### 

### Other Resource for Reference Genomes

Other than the GATK Resource Bundle, available via FTP, we can download reference genomes from either [Ensemble ](http://uswest.ensembl.org/index.html)or the [UCSC Genome Browser](http://hgdownload.soe.ucsc.edu/downloads.html). From the USCS Genome Browser, if you click on Human --> Full Data Set, and then scroll down, you will see many links for zipped files that end in "fa." It looks like there are multiple choices, and obviously you would choose based on your particular data. To test, I chose the [hg19 2bit file](http://hgdownload.cse.ucsc.edu/goldenPath/hg19/bigZips/hg19.2bit), and I found [this application](http://hgdownload.cse.ucsc.edu/admin/exe/linux.x86_64/twoBitToFa) for converting it to fa, as recommended by some colleagues.  In the case that you want whole genome (using the hg19.fa file) here is how to convert 2bit to fa:

code

That's all for today!

