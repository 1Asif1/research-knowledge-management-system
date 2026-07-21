package com.clarivate.paperservice.Util;



import com.clarivate.paperservice.Entity.PaperVersion;

import java.util.List;

public class PaperVersionUtil {

    private PaperVersionUtil() {
    }

    public static int getNextVersion(List<PaperVersion> versions) {

        return versions.stream()
                .map(PaperVersion::getVersion)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }
}