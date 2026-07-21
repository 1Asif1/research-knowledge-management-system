package com.clarivate.paperservice.Util;



import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Entity.Paper;

public class MapperUtil {

    private MapperUtil() {
    }

    public static PaperResponse toResponse(Paper paper) {

        PaperResponse response = new PaperResponse();

        response.setId(paper.getId());
        response.setTitle(paper.getTitle());
        response.setDescription(paper.getDescription());
        response.setTitle(paper.getTitle());
        response.setCoAuthors(paper.getCoAuthors());


        return response;
    }
}